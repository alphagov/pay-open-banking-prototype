import {createPayment, getAccessToken, getProviderSelection, submitProviderSelection} from "../lib/truelayer/client";
import {NextFunction, Request, Response} from "express";

export async function startPayment(req: Request, res: Response, next: NextFunction) {
    try {
        const accessToken = await getAccessToken()
        const payment = await createPayment(accessToken)
        const authResponse = await getProviderSelection(payment.id, accessToken)
        // TODO: we would show a bank selection screen now, but for now just pick the first provider
        const providerId = authResponse.authorization_flow.actions.next.providers[0].id
        const redirectResponse = await submitProviderSelection(payment.id, providerId, accessToken)
        res.redirect(redirectResponse.authorization_flow.actions.next.uri)
    } catch (err) {
        next(err)
    }
}
