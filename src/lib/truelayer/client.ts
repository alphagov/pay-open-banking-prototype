import * as tlSigning from 'truelayer-signing'
import {HttpMethod} from 'truelayer-signing'
import axios from 'axios'
import process from 'process';
import crypto from 'crypto';
import {ProviderSelection, RedirectResponse, TrueLayerPayment} from "./types";

const TRUELAYER_API_BASE_URL = 'https://api.truelayer-sandbox.com'
const TRUELAYER_AUTH_BASE_URL = 'https://auth.truelayer-sandbox.com/'

function generateSignature(idempotencyKey: string, data: object, path: string) {
    return tlSigning.sign({
        kid: process.env.TRUELAYER_PUBLIC_KEY_KID,
        privateKeyPem: process.env.TRUELAYER_PRIVATE_KEY_PEM,
        method: HttpMethod.Post,
        path,
        headers: {'Idempotency-Key': idempotencyKey},
        body: data && JSON.stringify(data)
    })
}

export async function createPayment(accessToken: string): Promise<TrueLayerPayment> {
    const idempotencyKey = crypto.randomUUID()
    const data = {
        amount_in_minor: 1000,
        currency: 'GBP',
        user: {
            name: 'Mr Test',
            email: 'foo@example.com'
        },
        payment_method: {
            type: 'bank_transfer',
            provider_selection: {
                type: 'user_selected'
            },
            beneficiary: {
                type: 'merchant_account',
                account_holder_name: 'Cabinet office',
                merchant_account_id: '12c253d1-372e-45c7-9d8d-ae7c35e71bb6',
                reference: 'Cabinet Office - Cake'
            }
        }
    }
    const url = '/v3/payments';
    const signature = generateSignature(idempotencyKey, data, url);
    const response = await axios({
        baseURL: TRUELAYER_API_BASE_URL,
        url,
        method: 'POST',
        data,
        headers: {
            'Tl-Signature': signature,
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Idempotency-Key': idempotencyKey
        }
    })
    return response && response.data
}

export async function getProviderSelection(paymentId: string, accessToken: string): Promise<ProviderSelection> {
    const idempotencyKey = crypto.randomUUID()
    const data = {
        provider_selection: {},
        redirect: {
            "return_uri": "http://localhost:8080/callback"
        }
    }
    const url = `/v3/payments/${paymentId}/authorization-flow`;
    const signature = generateSignature(idempotencyKey, data, url);
    const response = await axios({
        baseURL: TRUELAYER_API_BASE_URL,
        url,
        method: 'POST',
        data,
        headers: {
            'Tl-Signature': signature,
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Idempotency-Key': idempotencyKey
        }
    })
    return response && response.data
}

export async function submitProviderSelection(paymentId: string, providerId: string, accessToken:string): Promise<RedirectResponse> {
    const idempotencyKey = crypto.randomUUID()
    const data = {
        provider_id: providerId,
    }
    const url = `/v3/payments/${paymentId}/authorization-flow/actions/provider-selection`;
    const signature = generateSignature(idempotencyKey, data, url);
    const response = await axios({
        baseURL: TRUELAYER_API_BASE_URL,
        url,
        method: 'POST',
        data,
        headers: {
            'Tl-Signature': signature,
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Idempotency-Key': idempotencyKey
        }
    })
    return response && response.data
}

export async function getAccessToken(): Promise<string> {
    const data = {
        grant_type: 'client_credentials',
        client_id: process.env.TRUELAYER_CLIENT_ID,
        client_secret: process.env.TRUELAYER_CLIENT_SECRET,
        scope: 'payments'
    }
    const response = await axios({
        baseURL: TRUELAYER_AUTH_BASE_URL,
        url: '/connect/token',
        method: 'post',
        data,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        }
    })
    if (response.status === 200) {
        return response.data && response.data.access_token
    }
    throw new Error('Request failed with status code ' + response.status)
}
