import { Application } from 'express'
import fetch from 'node-fetch'

import { API_ENDPOINT } from './structures/Constants'
import Generator from './classes/KeyGenerator'

import Methods from './classes/Methods'
import Logger from './classes/Logger'
import Timestamp from './classes/Timestamp'

import AvailableParamsObject from './interfaces/AvailableParamsObject'
import QuadraticEquation from './interfaces/QuadraticEquation'

import DatabaseManager from './managers/DatabaseManager'
import { json } from 'stream/consumers'

const pingsHistoryLength = 5
const pings: number[] = []

for (let i = 0; i < pingsHistoryLength; i++) pings.push(0)

const equations = new DatabaseManager('./data/quadratic-equations.json')
if (!Object.keys(equations.all())) equations.set('quadratic-equations', [])

const numberBases = new DatabaseManager('./data/number-bases.json')
if (!Object.keys(numberBases.all())) numberBases.set('number-bases', [])

class API extends Methods {

    /**
     * Website Express application.
     */
    public app: Application

    /**
     * The Logger class.
     */
    public logs = new Logger({
        colorized: true
    })

    /**
     * Website port.
     */
    public port: number

    private generateTimestamp = new Timestamp().generateTimestamp

    /**
     * The API class.
     * @param {Application} app Website Express application.
     * @param {Number} port Website port.
     */
    constructor(app: Application, port: number = 3000) {
        super()

        this.app = app
        this.port = port
    }

    /**
     * Starts and inits the API.
     */
    init() {

        ////////////////////////////////////////
        ///////////  TEST REQUESTS  ////////////
        ////////////////////////////////////////

        this.app.get(API_ENDPOINT + 'test', (req, res) => {
            try {
                const authkey = req.headers.authorization

                if (!authkey) return res.json({ code: 401, message: 'Unauthorized.' })
                res.json({ code: 200, message: 'Hello World!' })
            } catch (err) {
                res.status(500).send({
                    code: 500,
                    message: 'Failed to receive a responce from API.',
                    error: `${err.name}: ${err.message}`
                })
            }
        })

        this.app.get(API_ENDPOINT + 'ping', (req, res) => {
            try {
                const pingsArray = pings.slice(pings.length - pingsHistoryLength).reverse()

                res.json({
                    code: 200,
                    message: 'Pinged successfully!',
                    pings: pingsArray,
                    ping: pingsArray[0]
                })

            } catch (err) {
                res.status(500).send({
                    code: 500,
                    message: 'Failed to receive a responce from API.',
                    error: `${err.name}: ${err.message}`
                })
            }
        })

        // creating 2 test accounts
        this.app.get(API_ENDPOINT + 'create', (req, res) => {
            try {
                const date = new Date()
                this.accounts.create({
                    ip: req.ip,

                    username: '123',
                    password: '123',
                    email: 'a@a.ru',

                    verified: true,
                    admin: true,

                    createdAt: date,
                    createdTimestamp: this.generateTimestamp(date),
                })

                this.accounts.create({
                    ip: req.ip,

                    username: '321',
                    password: '321',
                    email: 'aaa@aaaa.com',

                    verified: false,
                    admin: false,

                    createdAt: date,
                    createdTimestamp: this.generateTimestamp(date)
                })

                res.json({ code: 200, message: 'Successfully created 2 test accounts!' })
            } catch (err) {
                res.status(500).send({
                    code: 500,
                    message: 'Failed to receive a responce from API.',
                    error: `${err.name}: ${err.message}`,
                })
            }
        })


        ////////////////////////////////////////
        ////////////  LOG REQUESTS  ////////////
        ////////////////////////////////////////

        this.app.get(API_ENDPOINT + 'logs/get', (req, res) => {
            try {
                const cookies = this.parseCookies(req.headers.cookie)

                const email = cookies.email as string
                const account = this.accounts.find({ email })

                if (!account || !account.admin) return res.status(403).json({
                    code: 403,
                    status: false,
                    message: 'Access denied to fetch the website logs',
                    logs: []
                })

                res.json({
                    code: 200,
                    status: true,
                    message: 'Fetched the logs successfully!',
                    logs: this.logs.get()
                })

            } catch (err) {
                res.status(500).send({
                    code: 500,
                    status: false,
                    message: 'Failed to receive a responce from API.',
                    error: `${err.name}: ${err.message}`
                })
            }
        })


        ////////////////////////////////////////
        /////////  ACCOUNT REQUESTS  ///////////
        ////////////////////////////////////////

        this.app.post(API_ENDPOINT + 'login/:email/:password/:rememberMe', (req, res) => {
            try {
                const { email, password }: AvailableParamsObject = req.params

                const account = this.accounts.find({ email, password })
                const status = this.accounts.login({ email, password })

                if (!status) {
                    this.logs.sendLog('loginFailed', {
                        url: req.url,
                        ip: req.ip,

                        login: {
                            email,
                            password
                        }
                    })

                    return res.status(400).json({
                        code: 400,
                        status: false,
                        message: 'Incorrect login details were provided.'
                    })
                }

                this.logs.sendLog('login', {
                    url: req.url,
                    ip: req.ip,

                    login: {
                        email: account.email,
                        username: account.username,
                        password
                    }
                })

                return res.json({
                    code: 200,
                    status: true,
                    message: 'Logged in successfully!',
                    account
                })

            } catch (err) {
                res.status(500).send({
                    code: 500,
                    message: 'Failed to receive a responce from API.',
                    error: `${err.name}: ${err.message}`
                })
            }
        })

        this.app.post(API_ENDPOINT + 'register/:username/:email/:password', (req, res) => {
            const { email, username, password }: AvailableParamsObject = req.params

            const sameEmailAccount = this.accounts.find({ email })

            if (sameEmailAccount) return res.status(403).json({
                code: 403,
                status: false,
                message: `Email "${email}" is already in use.`,
                account: null
            })

            const verificationToken = this.generator.generateKey(128, false)
            const account = this.accounts.create({
                ip: req.ip,

                email,
                username,
                password,

                verified: false,
                admin: false,

                verificationToken
            })

            this.mailer.send(email, {
                subject: `Активация аккаунта ${username} [${email}]`,
                text: 'Для подтверждения аккаунта следуйте инструкциям.',
                html: `<h1>Активация аккаунта</h1><br>
                <p>Вы указали данный адрес электронной почты при регистрации аккаунта <b>${username}</b> на сайте <a href="${this.appURL}">${this.appURL}</a>.</p><br><br>
                
                <p>Чтобы активировать ваш аккаунт, перейдите по ссылке ниже:</p><br>

                <b><a href="${this.appURL}/emailVerification?token=${verificationToken}">
                    ${this.appURL}/emailVerification?token=${verificationToken}
                </a></b><br><br>
                
                <footer style="size: 2px">Если вы не регистрировали аккаунт на этом сайте, то просто проигнорируйте это письмо.</footer>`,
            })

            return res.json({
                code: 200,
                status: true,
                message: 'Account was successfully created and sent the email! Account verification is required now.',
                account
            })
        })

        this.app.post(API_ENDPOINT + 'logout/:email/:username/:password', (req, res) => {
            try {
                const { email, username, password }: AvailableParamsObject = req.params

                const account = this.accounts.find({ email, username, password })
                const status = this.accounts.logout(email, username, password, req.ip)

                if (!status) {
                    this.logs.sendLog('badActivity', {
                        url: req.url,
                        ip: req.ip,

                        login: {
                            email,
                            username,
                            password
                        }
                    })

                    return res.json({
                        code: 400,
                        status: false,
                        message: 'Incorrect login details were provided.'
                    })
                }

                this.logs.sendLog('logout', {
                    url: req.url,
                    ip: req.ip,

                    login: {
                        email,
                        username,
                        password
                    }
                })

                return res.json({
                    code: 200,
                    status: true,
                    message: 'Logged out successfully!',
                    account
                })

            } catch (err) {
                res.status(500).send({
                    code: 500,
                    message: 'Failed to receive a responce from API.',
                    error: `${err.name}: ${err.message}`
                })
            }
        })

        this.app.post(API_ENDPOINT + 'password-reset/:email', (req, res) => {
            const { email }: AvailableParamsObject = req.params

            const accounts = this.accounts.list()

            const account = this.accounts.find({ email })

            if (!account) return res.status(404).json({
                code: 200,
                status: false,
                message: `Cannot find account with email ${email}.`
            })

            if (account.passwordResetToken) return res.status(400).json({
                code: 400,
                status: false,
                message: 'The email was already sent.'
            })

            const passwordResetToken = this.generator.generateKey(128, false)
            
            account.edit({ passwordResetToken })

            this.mailer.send(email, {
                subject: `Сброс пароля аккаунта ${account.username} [${account.email}]`,
                text: 'Сброс пароля',
                html: `<h1>Сброс пароля</h1><br>
                <p>Вы запросили сброс пароля для своего аккаунта <b>${account.username}</b> на сайте <a href="${this.appURL}">${this.appURL}</a>.</p><br><br>
                
                <p>Для сброса пароля вашего аккаунта, перейдите по ссылке ниже:</p><br>

                <b><a href="${this.appURL}/passwordReset?token=${passwordResetToken}">
                    ${this.appURL}/passwordReset?token=${passwordResetToken}
                </a></b><br><br>
                
                <footer style="size: 2px">Если вы не запрашивали сброс пароля, то просто проигнорируйте это письмо.</footer>`
            })

            res.json({
                code: 200,
                status: true,
                message: 'Successfully sent a password reset email!'
            })
        })

        this.app.post(API_ENDPOINT + 'resetPassword/:token/:newPassword', (req, res) => {
            const { token, newPassword }: AvailableParamsObject = req.params
            const account = this.accounts.find({ passwordResetToken: token })

            if (!account) return res.status(404).json({
                code: 404,
                status: false,
                message: 'Cannot find an account with the specified password reset token.',
                account: null
            })

            const newAccount = account.edit({ password: newPassword, passwordResetToken: null })
            
            this.mailer.send(account.email, {
                subject: `Сброс пароля аккаунта ${account.username} [${account.email}]`,
                text: 'Пароль был успешно сброшен!',
                html: `<h1>Сброс пароля</h1><br>
                <p>Вы успешно изменили пароль от своего аккаунта <b>${account.username}</b> на сайте ${this.appURL.startsWith('http') ? this.appURL : `http://${this.appURL}`}.</p><br>
                <p>Теперь вход в ваш аккаунт будет проходить с помощью нового пароля, который вы указали во время процедуры сброса.</p><br>

                <footer style="size: 2px">Это письмо было отправлено автоматически в качестве уведомления. Отвечать на него не нужно.</footer>`
            })

            res.json({
                code: 200,
                status: false,
                message: 'Password has been successfully reset!',
                account: newAccount
            })
        })


        ////////////////////////////////////////
        //////////  OTHER REQUESTS  ////////////
        ////////////////////////////////////////

        this.app.get(API_ENDPOINT + 'reportBadActivity/:email/:username/:password', (req, res) => {
            const { email, username, password }: AvailableParamsObject = req.params

            if (!req.ip.includes('62.109.19.9') && req.ip !== '::1') {
                return res.status(403).json({
                    code: 403,
                    status: false,
                    message: 'You cannot do that.',
                    yourIP: req.ip
                })
            }

            this.logs.sendLog('badActivity', {
                ip: req.ip,
                url: null,

                login: {
                    email,
                    username,
                    password
                }
            })

            return res.json({
                code: 200,
                status: true,
                message: 'Reported successfully.',
                yourIP: req.ip
            })
        })

        this.app.get(API_ENDPOINT + 'solutions/quadratic-equations/create/:a/:b/:c', (req, res) => {
            const [a, b, c]: number[] = Object.values(req.params).map(x => Number(x))

            const equationsList: QuadraticEquation[] = equations.fetch('quadratic-equations') || []
            const equationID = equationsList?.length ? equationsList[equationsList?.length - 1].id + 1 : 1

            if (isNaN(a as null) || isNaN(b as null) || isNaN(c as null)) return res.status(400).json({
                code: 400,
                status: false,
                message: 'The parameters are must be type of number.',
                params: {
                    a,
                    b,
                    c
                }
            })

            const equation = equationsList.find(x =>
                x.a == a &&
                x.b == b &&
                x.c == c
            )

            if (equation) return res.json({
                code: 304,

                status: false,
                message: 'This equation is already in database.',

                id: equation.id,

                params: {
                    a,
                    b,
                    c
                },

                solutionClicks: equation.solutionClicks,
                sharingLink: this.appURL + `/solutions/quadratic-equations/${equation.id}`
            })

            equations.push('quadratic-equations', {
                id: equationID,

                a,
                b,
                c,

                solutionClicks: 0
            })

            res.json({
                code: 200,

                status: true,
                message: 'Successfully saved the quadratic equation!',

                id: equationID,
                params: {
                    a,
                    b,
                    c
                },

                sharingLink: this.appURL + `/solutions/quadratic-equations/${equationID}`
            })
        })

        this.app.get(API_ENDPOINT + 'solutions/quadratic-equations/get/:id', (req, res) => {
            const equationID = Number(req.params.id)
            const equation: QuadraticEquation = equations.fetch(`quadratic-equations.${equationID - 1}`)

            if (!equation) return res.status(400).json({
                code: 400,

                status: false,
                message: `Cannot find the equation with ID ${equationID}.`,

                id: equationID,
                ratios: null
            })

            res.json({
                code: 200,

                status: true,
                message: `Found an equation with ID ${equationID}.`,

                id: equationID,
                ratios: {
                    a: equation.a,
                    b: equation.b,
                    c: equation.c
                }
            })
        })



        this.app.get(API_ENDPOINT + 'solutions/number-bases/create/:number/:base1/:base2', (req, res) => {
            const [number, base1, base2]: number[] = Object.values(req.params).map(x => Number(x))

            const solutionsList = numberBases.fetch('number-bases') || []
            const solutionID = solutionsList?.length ? solutionsList[solutionsList?.length - 1].id + 1 : 1

            if (isNaN(number as null) || isNaN(base1 as null) || isNaN(base2 as null)) return res.status(400).json({
                code: 400,
                status: false,
                message: 'The parameters are must be type of number.',
                params: {
                    number,
                    base1,
                    base2
                }
            })

            const solution = solutionsList.find(x =>
                x.number == number &&
                x.base1 == base1 &&
                x.base2 == base2
            )

            if (solution) return res.json({
                code: 304,

                status: false,
                message: 'This solution is already in database.',

                id: solution.id,

                params: {
                    number,
                    base1,
                    base2
                },

                solutionClicks: solution.solutionClicks,
                sharingLink: this.appURL + `/solutions/number-bases/${solution.id}`
            })

            numberBases.push('number-bases', {
                id: solutionID,

                number,
                base1,
                base2,

                solutionClicks: 0
            })

            res.json({
                code: 200,

                status: true,
                message: 'Successfully saved the solution!',

                id: solutionID,
                params: {
                    number,
                    base1,
                    base2
                },

                sharingLink: this.appURL + `/solutions/number-bases/${solutionID}`
            })
        })

        this.app.get(API_ENDPOINT + 'solutions/number-bases/get/:id', (req, res) => {
            const solutionID = Number(req.params.id)
            const solution = equations.fetch(`number-bases.${solutionID - 1}`)

            if (!solution) return res.status(400).json({
                code: 400,

                status: false,
                message: `Cannot find the solution with ID ${solutionID}.`,

                id: solutionID,
                ratios: null
            })

            res.json({
                code: 200,

                status: true,
                message: `Found an solution with ID ${solution}.`,

                id: solution,
                params: {
                    number: solution.number,
                    base1: solution.base1,
                    base2: solution.base2
                }
            })
        })


        const sendPing = () => {
            const startDate = Date.now()

            let appURL = this.appURL
            if (!appURL.startsWith('http://')) appURL = 'http://' + this.appURL
            appURL = 'http://' + (appURL.includes('http://') ? appURL.slice('http://'.length) : appURL).split(':')[0] + `:${this.port}`

            fetch(`${appURL}/api/ping`).then(x => x.json()).then(() => {
                pings.push(Date.now() - startDate)

                setTimeout(() => {
                    sendPing()
                }, 300)

            }).catch(x => {
                console.error(x);
                pings.push(-1)

                setTimeout(() => {
                    sendPing()
                }, 300)
            })
        }

        sendPing()
    }
}

export = API