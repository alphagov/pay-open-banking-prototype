import express, {Express} from 'express'
import dotenv from 'dotenv'
import nunjucks from 'nunjucks'
import flash from 'connect-flash'
import session from 'express-session'

import logger from './logger'

import path from 'path'

dotenv.config()

const app = express()
const port = 8080

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

// Add routes here

app.listen(port, () => logger.info(`server started on port ${port}`))
