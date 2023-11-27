import {createPayment, getAccessToken, getProviderSelection, submitProviderSelection} from "../lib/truelayer/client";
import {NextFunction, Request, Response} from "express";

export async function showBankSelectorPage(req: Request, res: Response, next: NextFunction) {
    try {
        const accessToken = await getAccessToken()
        const payment = await createPayment(accessToken)
        const authResponse = await getProviderSelection(payment.id, accessToken)
        // TODO: we would show a bank selection screen now, but for now just pick the first provider
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
