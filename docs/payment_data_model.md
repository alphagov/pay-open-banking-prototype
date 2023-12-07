# Payment data model

### Essential fields

| Field               | Notes                                                                                                                                             |
|---------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| Id                  | Pay's internal unique Id                                                                                                                          |
| Date created        |                                                                                                                                                   |
| Status              |                                                                                                                                                   |
| Amount              |                                                                                                                                                   |
| Bank(Id)            | Not sure this is needed, but its analogous to a card brand (e.g. Visa, Amex) so I recommend we store this                                         |
| Provider Id         | This is the payment Id as stored by the PISP. Analogous to `gateway_transaction_id` in the `charges` table                                        |
| Merchant Id         | This could be a foreign key on the gateway account                                                                                                |
| Currency            |                                                                                                                                                   |
| Description         |                                                                                                                                                   |
| Reference           |                                                                                                                                                   |
| Reconciliation Date |                                                                                                                                                   |
| Paying user email   |                                                                                                                                                   |
| Paying user address |                                                                                                                                                   |
| Pay External Id     |                                                                                                                                                   |
| Return url          |                                                                                                                                                   |
| Email               |                                                                                                                                                   |
| Paying user name    |                                                                                                                                                   |
| Service Id          | This is a "foreign key" on a service table located in Adminusers' database                                                                        |
| Creditor Account    | This is probably a foreign key on Pay's settlement account (if using Ecospend/TrueLayer) or a Tink settlement account managed under Pay's acoount |

### Potential fields

Fields we probably won't need but listed here as a record that these have been considered.

| Field            | Notes                                                                                                     |
|------------------|-----------------------------------------------------------------------------------------------------------|
| Debtor Account   | Looking at PISP docs, we won't need this for refunds as we'll refund by a payment Id                      |
| Payment scheme   | "FPS", "SEPA" for example. Don't think we need this for now as the PISP should abstract this away from us |

## Refunds data model

| Field               | Notes                                                                                            |
|---------------------|--------------------------------------------------------------------------------------------------|
| Id                  | Pay's internal unique Id                                                                         |
| Pay External Id     |                                                                                                  |
| Status              |                                                                                                  |
| Original payment Id | Foreign key on the payment Id                                                                    |
| Amount              |                                                                                                  |
| Reference           | Payment reference that will be displayed on the bank statement. 18 characters MAX (for Ecospend) |
| Merchant Id         | This could be a foreign key on the gateway account                                               |
| Provider Id         | Refund Id as stored by the PISP. Analogous to `gateway_transaction_id` in the `refunds` table    |
| Date created        |                                                                                                  |

### Potential fields

Fields we probably won't need but listed here as a record that these have been considered.

| Field       | Notes                                                                                 |
|-------------|---------------------------------------------------------------------------------------|
| Merchant Id | Probably won't need as this is implicit in the reference to the original payment row. |

# Settlement Account data model

# Recommendations

The existing "charges" table in connector could encompass an OB payment but the recommendation is to use a specific 
table for OB as the "charges" table looks bloated with worldpay-specific information, wallet and moto flags, 3ds-related 
fields for instance.