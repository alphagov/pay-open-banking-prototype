import {NextFunction, Request, Response} from "express";
import process from "process";
import axios from "axios";
import logger from "../logger";

export async function showBankSelectorPage(req: Request, res: Response, next: NextFunction) {
    const providers = await getProviders()
    const banks = providers.map((provider: any) => ({
            displayName: provider.name,
            identifier: provider.bank_id
    }))
    res.render('bank_selector', {banks})
}

async function getAccessToken() {
    const params = new URLSearchParams();
    params.append('client_id', process.env.ECOSPEND_CLIENT_ID);
    params.append('client_secret', process.env.ECOSPEND_CLIENT_SECRET);
    params.append('grant_type', 'client_credentials');
    params.append('scope', 'px01.ecospend.pis.sandbox');
    const response = await axios.post('https://iamapi.sb.ecospend.com/connect/token', params)
    if (response.status !== 200) {
        logger.error('Something wrong with calling /v1/oauth/token')
        throw new Error()
    } else {
        return response.data.access_token
    }
}

async function getProviders() {
    const accessToken = await getAccessToken();
    const response = await axios({
        method: "GET",
        url: 'https://pisapi.sb.ecospend.com/api/v2.0/banks?is_sandbox=true',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    return response.data.data
}

export async function submitBankSelectorPage(req: Request, res: Response, next: NextFunction) {
    try {
        const bank = req.body.bank
        const accessToken = await getAccessToken();
        const response = await axios({
            method: "POST",
            url: 'https://pisapi.sb.ecospend.com/api/v2.0/payments',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            data: {
                "bank_id": `${bank}`,
                "amount": 10,
                "currency": "GBP",
                "description": "Any description text.",
                "reference": "OB test",
                "redirect_url": "https://www.wikipedia.org/",
                "merchant_id": "125458 | 00000000-2e6a-4bcb-8746-4f90528b2470",
                "merchant_user_id": "125458 | 00000000-2e6a-4bcb-8746-4f90528b2470",
                "creditor_account": {
                    "type": "SortCode",
                    "identification": "22113365432124",
                    "owner_name": "John Doe",
                    "currency": "GBP"
                }
            }})
        if (![200, 201].includes(response.status)) {
            logger.error('Unsuccessful call to pisapi.sb.ecospend.com/api/v2.0/payments')
            throw new Error()
        } else {
            res.redirect(response.data.payment_url);
        }
    } catch (e) {
        next(e)
    }
}
