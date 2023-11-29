import express, {Express} from 'express'
import dotenv from 'dotenv'
import nunjucks from 'nunjucks'
import flash from 'connect-flash'
import session from 'express-session'
import path from 'path'

import logger from './logger'
import * as tinkPayment from './web/tink_payment.http'
import * as truelayerPayment from './web/truelayer_payment.http'
import * as ecospendPayment from './web/ecospend_payment.http'
import {PORT} from './config'

dotenv.config()

const app = express()

app.use(express.static(__dirname + '/public'))
app.use('/', express.static('node_modules/govuk-frontend/govuk'))

const templatePathRoots = [path.join(process.cwd(), 'node_modules/govuk-frontend'), path.join(__dirname, 'views')]
nunjucks.configure(templatePathRoots, {autoescape: true, express: app})
app.set('view engine', 'njk')

app.use(session({ cookie: { maxAge: 60000 },
    secret: process.env.COOKIE_SESSION_ENCRYPTION_SECRET || "secretkey",
    resave: false,
    saveUninitialized: false}));
app.use(express.urlencoded({ extended: false }))
app.use(express.json({ strict: true, limit: '15kb' }))
app.use(flash())

// Tink routes
app.get('/tink/payment', tinkPayment.showBankSelectorPage)
app.post('/tink/payment', tinkPayment.redirectToBankAccountLoginMethod)
app.get('/tink/select-login-method', tinkPayment.selectLoginMethod)
app.post('/tink/select-login-method', tinkPayment.makeBankPayment)
app.get('/tink/callback', tinkPayment.handleReturn)
app.get('/tink/qr-method', tinkPayment.makeBankPayment)

// TrueLayer routes
app.get('/truelayer/payment', truelayerPayment.showBankSelectorPage)
app.post('/truelayer/payment', truelayerPayment.submitBankSelectorPage)
app.get('/truelayer/callback', truelayerPayment.handleReturn)

// Ecospend routes
app.get('/ecospend/payment', ecospendPayment.showBankSelectorPage)
app.post('/ecospend/payment', ecospendPayment.submitBankSelectorPage)

app.listen(PORT, () => logger.info(`server started on port ${PORT}`))
