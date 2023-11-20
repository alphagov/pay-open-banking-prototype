import {Request, Response, NextFunction} from 'express'

// Example callback url for an error payment: http://localhost:8080/callback?credentials=aa08a11adcfa4cae8c6c7778c70e5ba5&error=BAD_REQUEST&error_reason=INVALID_STATE_PAYMENT_RETRY_NOT_ALLOWED&message=We%27re%20sorry%2C%20an%20error%20has%20occurred&payment_request_id=0904ca74d62940c686343a9dfe82e56a&tracking_id=21ee7ad7-2fbe-4a58-8993-6799dbc4fc31
// Example callback url for a successful payment: http://localhost:8080/callback?payment_request_id=xxx
export async function success(req: Request, res: Response, next: NextFunction) {
    // pass payment result details to connector for example
    res.render('payment_success', {paymentId: req.query.payment_request_id})
}
