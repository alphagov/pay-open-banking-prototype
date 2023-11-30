import process from "process";
import axios from "axios";
import logger from "../../logger";
import {Payment} from "./types";

const ECOSPEND_API_BASE_URL = 'https://pisapi.sb.ecospend.com/api/v2.0'

export async function getAccessToken() {
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

export async function getProviders() {
    const accessToken = await getAccessToken();
    const response = await axios({
        method: "GET",
        baseURL: ECOSPEND_API_BASE_URL,
        url: '/banks',
        params: {
            is_sandbox: true
        },
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    return response.data.data
}

export async function createPayment(accessToken: string, bank: string): Promise<Payment> {
    const response = await axios({
        method: "POST",
        baseURL: ECOSPEND_API_BASE_URL,
        url: '/payments',
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
            "redirect_url": "http://localhost:8080/ecospend/callback",
            "merchant_id": "125458 | 00000000-2e6a-4bcb-8746-4f90528b2470",
            "merchant_user_id": "125458 | 00000000-2e6a-4bcb-8746-4f90528b2470",
            "creditor_account": {
                "type": "SortCode",
                "identification": "22113365432124",
                "owner_name": "John Doe",
                "currency": "GBP"
            }
        }
    });
    return response && response.data
}

export async function getPayment(accessToken: string, paymentId: string): Promise<Payment> {
    const response = await axios({
        method: "GET",
        baseURL: ECOSPEND_API_BASE_URL,
        url: `/payments/${paymentId}`,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });
    return response && response.data
}

