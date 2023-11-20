# pay-open-banking-prototype
GOV.UK Pay prototype for an open banking user journey

## Running

`npm install && npm run compile`

`npm run start`

## Doing a demo

At the moment, follow the [Tink curl instructions for a one-time payment](https://docs.tink.com/resources/payments/one-time-payments/initiate-your-first-one-time-payment).
At [3. Build a Tink URL](https://docs.tink.com/resources/payments/one-time-payments/initiate-your-first-one-time-payment#build-a-tink-url), use
the [tink link helper](https://console.tink.com/payments/tink-link) to build a tink url.

Enter that url in the browser and make a payment.

The payment outcome should redirect to http://localhost:8080/callback on this app.