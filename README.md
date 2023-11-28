# pay-open-banking-prototype

GOV.UK Pay prototype for an open banking user journey

## Running

Create a `.env` file by making a copy of `.env.example` and fill in values the environment variables.

`npm install && npm run compile`

`npm run start`

## Run a Tink demo

### Environment variables

Ensure the following environment variables are passed in to the run command or set in the `.env` file:

| Environment variable | Description                        |
|----------------------|------------------------------------|
| TINK_CLIENT_ID       | The client ID for the Tink app     |
| TINK_CLIENT_SECRET   | The client secret for the Tink app |

### Make a payment

Visit `http://localhost:8080/tink/payment`

## Run a TrueLayer demo

### Environment variables

Ensure the following environment variables are passed in to the run command or set in the `.env` file:

| Environment variable      | Description                                                                                                                     |
|---------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| TRUELAYER_CLIENT_ID       | The client ID for the TrueLayer app                                                                                             |
| TRUELAYER_CLIENT_SECRET   | The client secret for the TrueLayer app                                                                                         |
| TRUELAYER_PUBLIC_KEY_KID  | The public key ID (KID) for signing API requests. This was generated by the TrueLayer console when the public key was uploaded. |
| TRUELAYER_PRIVATE_KEY_PEM | The private key for signing API requests                                                                                        |

To run with these environment variables pulled from `pay-dev-pass`:

```sh
TRUELAYER_CLIENT_ID=$(pay-dev-pass open-banking-prototype/truelayer/sandbox/client-id) \
TRUELAYER_CLIENT_SECRET=$(pay-dev-pass open-banking-prototype/truelayer/sandbox/client-secret) \
TRUELAYER_PUBLIC_KEY_KID=$(pay-dev-pass open-banking-prototype/truelayer/sandbox/request-signing-public-key-kid) \
TRUELAYER_PRIVATE_KEY_PEM=$(pay-dev-pass open-banking-prototype/truelayer/sandbox/request-signing-private-key) \
npm run start
```

### Make a payment

Visit `http://localhost:8080/truelayer/payment`

## Run an Ecospend demo

### Environment variables

Ensure the following environment variables are passed in to the run command or set in the `.env` file:

| Environment variable   | Description                            |
|------------------------|----------------------------------------|
| ECOSPEND_CLIENT_ID     | The client ID for the Ecospend app     |
| ECOSPEND_CLIENT_SECRET | The client secret for the Ecospend app |

You can generate a secret in the [Ecospend Management Console](https://console.sb.ecospend.com/organization/clients). 

### Make a payment

Visit `http://localhost:8080/make-an-ecospend-payment`

After the confirming the payment through the bank, the app will redirect to a predefined redirect_url.
The redirect_url has to be registered in the [Ecospend Management Console](https://console.sb.ecospend.com/organization/clients).

