import {Request, Response, NextFunction} from 'express'
import axios from 'axios'
import * as process from "process"
import logger from '.././logger'

const port = 8080

// Example callback url for an error payment: http://localhost:8080/callback?credentials=aa08a11adcfa4cae8c6c7778c70e5ba5&error=BAD_REQUEST&error_reason=INVALID_STATE_PAYMENT_RETRY_NOT_ALLOWED&message=We%27re%20sorry%2C%20an%20error%20has%20occurred&payment_request_id=0904ca74d62940c686343a9dfe82e56a&tracking_id=21ee7ad7-2fbe-4a58-8993-6799dbc4fc31
// Example callback url for a successful payment: http://localhost:8080/callback?payment_request_id=xxx
export async function success(req: Request, res: Response, next: NextFunction) {
    // pass payment result details to connector for example
    res.render('payment_success', {paymentId: req.query.payment_request_id})
}

export async function requestPayment(req: Request, res: Response, next: NextFunction) {
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
            res.send({next_url: createTinkUrl(response.data.id)})
        }
    } catch (e) {
        next(e)
    }
}

function createTinkUrl(paymentRequestId: string) {
    return `https://link.tink.com/1.0/pay/?client_id=${process.env.TINK_CLIENT_ID}&redirect_uri=http%3A%2F%2Flocalhost%3A${port}%2Fcallback&market=GB&locale=en_US&payment_request_id=${paymentRequestId}`
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
