import {NextFunction, Request, Response} from "express";
import logger from "../logger";
import {createPayment, getAccessToken, getPayment, getProviders} from "../lib/ecospend/client";

export async function showBankSelectorPage(req: Request, res: Response, next: NextFunction) {
    try {
        const providers = await getProviders()
        const banks = providers.map((provider: any) => ({
            displayName: provider.name,
            identifier: provider.bank_id
        }))
        res.render('bank_selector', {banks})
    } catch (err) {
        next(err)
    }
}

export async function submitBankSelectorPage(req: Request, res: Response, next: NextFunction) {
    try {
        const bank = req.body.bank
        const accessToken = await getAccessToken();
        const payment = await createPayment(accessToken, bank)
        res.redirect(payment.payment_url);
    } catch (e) {
        next(e)
    }
}

export async function handleReturn(req: Request, res: Response, next: NextFunction) {
    try {
        const paymentId = req.query.payment_id as string
        logger.info('Handled return', {
            query: JSON.stringify(req.query)
        })
        const accessToken = await getAccessToken();
        const payment = await getPayment(accessToken, paymentId);
        // The Ecospend docs say that we might get the status as verified, in which case we need to poll until we get a
        // terminal status.
        if (payment.status === 'Verified') {
            res.render('in_progress')
        } else if (payment.status === 'Canceled') {
            res.render('payment_cancelled')
        } else if (payment.status === 'Rejected') {
            res.render('payment_failed')
        } else if (payment.status === 'Completed') {
            res.render('payment_success')
        } else {
            res.render('payment_error')
        }
    } catch (err) {
        next(err)
    }
}
