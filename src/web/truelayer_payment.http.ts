import {
    createPayment,
    getAccessToken,
    getPayment,
    getProviderSelection,
    submitProviderSelection
} from "../lib/truelayer/client";
import {NextFunction, Request, Response} from "express";
import logger from "../logger";

export async function showBankSelectorPage(req: Request, res: Response, next: NextFunction) {
    try {
        const accessToken = await getAccessToken()
        const payment = await createPayment(accessToken)
        const authResponse = await getProviderSelection(payment.id, accessToken)
        const banks = authResponse.authorization_flow.actions.next.providers.map(provider => ({
            identifier: provider.id,
            displayName: provider.display_name
        }))
        res.render('bank_selector', {
            banks,
            paymentId: payment.id
        })
    } catch (err) {
        next(err)
    }
}

export async function submitBankSelectorPage(req: Request, res: Response, next: NextFunction) {
    try {
        const {bank, paymentId} = req.body
        const accessToken = await getAccessToken()
        const redirectResponse = await submitProviderSelection(paymentId, bank, accessToken)
        res.redirect(redirectResponse.authorization_flow.actions.next.uri)
    } catch (err) {
        next(err)
    }
}

export async function handleReturn(req: Request, res: Response, next: NextFunction) {
    try {
        const paymentId = req.query && req.query.payment_id as string
        const accessToken = await getAccessToken()
        const payment = await getPayment(paymentId, accessToken)
        if (['authorizing', 'authorized'].includes(payment.status)) {
            // The payment status might not have reached a terminal state when we reach this page. If it is still
            // authorising, show a page with a spinner that refreshes the page until we get a terminal state.
            logger.info('Payment is authorising - showing spinner page. Status: ' + payment.status)
            res.render('in_progress')
        } else if (payment.status === 'failed') {
            if (payment.failure_reason === 'canceled') {
                res.render('payment_cancelled')
            } else if (payment.failure_reason === 'unknown_error') {
                res.render('payment_error')
            } else {
                logger.info('Payment failed, failure reason: ' + payment.failure_reason)
                res.render('payment_failed')
            }
        } else if (['executed', 'settled'].includes(payment.status)) {
            res.render('payment_success')
        } else {
            logger.info('Unexpected payment status ' + payment.status)
            res.render('payment_error')
        }
    } catch (err) {
        next(err)
    }
}
