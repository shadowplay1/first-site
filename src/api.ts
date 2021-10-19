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
                    ip: null,

                    username: '123',
                    password: '321',
                    email: 'a@a.ru',

                    admin: true,
                    remember: true,

                    createdAt: date,
                    createdTimestamp: this.generateTimestamp(date)
                })

                this.accounts.create({
                    ip: null,

                    username: '321',
                    password: '321',
                    email: 'aaa@aaaa.com',

                    admin: false,
                    remember: false,

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

                res.json({
                    code: 200,
                    message: 'Fetched the logs successfully!',
                    logs: this.logs.get()
                })

            } catch (err) {
                res.status(500).send({
                    code: 500,
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
                const { email, password, rememberMe }: AvailableParamsObject = req.params

                const account = this.accounts.find({ email, password })
                const status = this.accounts.login({ email, password, ip: req.ip, remember: rememberMe })

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

        this.app.post(API_ENDPOINT + 'logout/:email/:username/:password', (req, res) => {
            try {
                const { email, username, password }: AvailableParamsObject = req.params

                const account = this.accounts.find({ email, username, password, ip: req.ip })
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

        this.app.get(API_ENDPOINT + 'users/find/:username', (req, res) => {
            try {
                const { username }: AvailableParamsObject = req.params
                const accounts = this.accounts.findAll({ username })

                if (!accounts.length) return res.status(404).json({
                    code: 404,
                    status: false,
                    message: `No accounts found with username ${username}.`,
                    results: []
                })

                return res.json({
                    code: 200,
                    status: true,
                    message: `Found ${accounts.length} ${accounts.length == 1 ? 'account' : 'accounts'} with username ${username}.`,
                    results: accounts.map(x => {
                        x.ip = null
                        x.password = null
                    })
                })

            } catch (err) {
                res.status(500).send({
                    code: 500,
                    message: 'Failed to receive a responce from API.',
                    error: `${err.name}: ${err.message}`
                })
            }
        })

        this.app.get(API_ENDPOINT + 'users/get/:id', (req, res) => {
            try {
                const { id }: AvailableParamsObject = req.params
                const account = this.accounts.get(id)

                if (!account) return res.status(404).json({
                    code: 404,
                    status: false,
                    message: `No accounts found with ID ${id}.`,
                    result: null
                })

                account.ip = null
                account.password = null

                return res.json({
                    code: 200,
                    status: true,
                    message: `Found an account with ID ${id}.`,
                    result: account
                })

            } catch (err) {
                res.status(500).send({
                    code: 500,
                    message: 'Failed to receive a responce from API.',
                    error: `${err.name}: ${err.message}`
                })
            }
        })

        ////////////////////////////////////////
        /////////  API KEY REQUESTS  ///////////
        ////////////////////////////////////////

        this.app.get(API_ENDPOINT + 'generateKey/:email/:password', (req, res) => {
            try {
                const { email, password }: AvailableParamsObject = req.params

                const generator = new Generator()
                const key = generator.generateKey()

                const accountIndex = this.accounts.findIndex({ email, password })
                console.log(email, password, accountIndex);

                if (accountIndex == -1) return res.status(400).json({
                    code: 400,
                    status: false,
                    message: 'Incorrect login details were provided.'
                })

                this.accounts.database.set(`accounts.${accountIndex}.apiKey`, key)

                return res.json({
                    code: 200,
                    status: true,
                    message: 'API Key was generated successfully!',
                    key
                })

            } catch (err) {
                res.status(500).send({
                    code: 500,
                    message: 'Failed to receive a responce from API.',
                    error: `${err.name}: ${err.message}`
                })
            }
        })


        ////////////////////////////////////////
        //////////  OTHER REQUESTS  ////////////
        ////////////////////////////////////////

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

/*

request code template:

this.app.get(API_ENDPOINT + 'request-url', (req, res) => {
    try {
        // code
    } catch (err) {
        res.status(500).send({
            code: 500,
            message: 'Failed to receive a responce from API.',
            error: `${err.name}: ${err.message}`
        })
    }
})

*/