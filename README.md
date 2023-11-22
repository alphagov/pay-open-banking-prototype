# pay-open-banking-prototype
GOV.UK Pay prototype for an open banking user journey

## Running

`npm install && npm run compile`

Set the `TINK_CLIENT_ID` and `TINK_CLIENT_SECRET` env vars.

`npm run start`

## Doing a Tink demo

`curl -X POST http://localhost:8080/make-a-tink-payment` to get a `next_url`. Open `next_url` and complete the payment.

The payment outcome should redirect to http://localhost:8080/callback on this app.