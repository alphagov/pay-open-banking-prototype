import {Request, Response, NextFunction} from 'express'
import axios from 'axios'
import * as process from "process"
import logger from '.././logger'
import url from 'url'
import qrcode from 'qrcode'
import {PORT} from "../config";

export async function showBankSelectorPage(req: Request, res: Response, next: NextFunction) {
    const providers = await getProviders()
    const banks = providers.map(provider => ({
        displayName: `${provider.displayName} - ${provider.displayDescription}`,
        identifier: `${provider.name}__${provider.displayName}`
    }))
    res.render('bank_selector', {banks})
}

export async function redirectToBankAccountLoginMethod(req: Request, res: Response, next: NextFunction) {
    const selectedBankIdentifier = req.body.bank.split('__')
    res.redirect(`/tink/select-login-method?provider=${selectedBankIdentifier[0]}&displayName=${selectedBankIdentifier[1]}`)
}

export async function selectLoginMethod(req: Request, res: Response, next: NextFunction) {
    const tinkRedirectUrl = await getTinkRedirectUrl(`${req.query.provider}`)
    const qrCodeDataUrl = await qrcode.toDataURL(tinkRedirectUrl)
    const data = {
        displayName: req.query.displayName,
        tinkRedirectUrl,
        qrCodeDataUrl
    }
    res.render('bank_account_login_method', data)
}

export async function makeBankPayment(req: Request, res: Response, next: NextFunction) {
    // TODO QR code method. Currently only works for same device.
    res.redirect(req.body.tinkRedirectUrl)
}

export async function getTinkRedirectUrl(provider: string) {
    try {
        const accessToken = await getAccessToken();
        const response = await axios({
            method: "POST",
            url: 'https://api.tink.com/api/v1/payments/requests',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            data: {
                "destinations": [
                    {
                        "accountNumber": "31245678901234",
                        "type": "sort-code"
                    }
                ],
                "amount": 10,
                "currency": "GBP",
                "market": "GB",
                "recipientName": "Test AB",
                "sourceMessage": "Payment for Gym Equipment",
                "remittanceInformation": {
                    "type": "REFERENCE",
                    "value": "CREDITOR-REF-12345"
                },
                "paymentScheme": "FASTER_PAYMENTS"
            }
        })
        if (![200, 201].includes(response.status)) {
            logger.error('Something wrong with calling /v1/payments/requests')
            throw new Error()
        } else {
            return createTinkUrl(response.data.id, provider)
        }
    } catch (e) {
        throw new Error()
    }
}

// Example callback url for an error payment: http://localhost:8080/callback?credentials=aa08a11adcfa4cae8c6c7778c70e5ba5&error=BAD_REQUEST&error_reason=INVALID_STATE_PAYMENT_RETRY_NOT_ALLOWED&message=We%27re%20sorry%2C%20an%20error%20has%20occurred&payment_request_id=0904ca74d62940c686343a9dfe82e56a&tracking_id=21ee7ad7-2fbe-4a58-8993-6799dbc4fc31
// Example callback url for a successful payment: http://localhost:8080/callback?payment_request_id=xxx
export async function handleReturn(req: Request, res: Response, next: NextFunction) {
    try {
        const paymentId = req.query.payment_request_id as string
        const error = req.query.error as string
        const message = req.query.message as string
        if (error) {
            if (error === 'USER_CANCELLED') {
                res.render('payment_cancelled')
            } else if (error === 'AUTHENTICATION_ERROR') {
                res.render('payment_failed', {message})
            } else {
                res.render('payment_error')
            }
        } else {
            const transfer = await getPaymentTransfer(paymentId)
            logger.info("Looked up transfer for successful payment.", {
                transferStatus: transfer.status,
                transferStatusMessage: transfer.statusMessage
            })
            res.render('payment_success', {
                paymentId
            })
        }
    } catch (err) {
        next(err)
    }
}

interface Provider {
    name: string;
    displayName: string;
    displayDescription: string;
}

async function getProviders(): Promise<Provider[]> {
    const accessToken = await getAccessToken();
    const response = await axios({
        method: "GET",
        url: 'https://api.tink.com/api/v1/providers/GB',
        params: {
            includeTestProviders: true
        },
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    return response.data.providers
}

function createTinkUrl(paymentRequestId: string, providerName: string) {
    const baseUrl = 'https://link.tink.com/1.0/pay/'
    const queryParams = {
        client_id: `${process.env.TINK_CLIENT_ID}`,
        redirect_uri: `http://localhost:${PORT}/tink/callback`,
        market: 'GB',
        locale: 'en_US',
        payment_request_id: `${paymentRequestId}`,
        input_provider: `${providerName}`
    }
    return url.format({
        pathname: baseUrl,
        query: queryParams,
    })
}

async function getAccessToken() {
    const params = new URLSearchParams();
    params.append('client_id', process.env.TINK_CLIENT_ID);
    params.append('client_secret', process.env.TINK_CLIENT_SECRET);
    params.append('grant_type', 'client_credentials');
    params.append('scope', 'payment:read,payment:write,providers:read');
    const response = await axios.post('https://api.tink.com/api/v1/oauth/token', params)
    if (response.status !== 200) {
        logger.error('Something wrong with calling /v1/oauth/token')
        throw new Error()
    } else {
        return response.data.access_token
    }
}

interface Transfer {
    status: string;
    statusMessage: string;
}

async function getPaymentTransfer(paymentId: string): Promise<Transfer> {
    const accessToken = await getAccessToken();
    const response = await axios({
        method: "GET",
        url: `https://api.tink.com/api/v1/payments/requests/${paymentId}/transfers`,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    return response.data && response.data.paymentRequestCreatedTransfers && response.data.paymentRequestCreatedTransfers[0]
}
