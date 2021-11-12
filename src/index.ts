import express from 'express'
import { inspect } from 'util'

import Methods from './classes/Methods'
import Logger from './classes/Logger'

import { pages } from '../Config'

import {
    DEFAULT_PORT,
    API_ENDPOINT
} from './structures/Constants'

import API from './api'

import UserAccount from './classes/UserAccount'

import DatabaseManager from './managers/DatabaseManager'

class Server extends Methods {

    /**
     * The Logger class.
     */
    public logger = new Logger({
        colorized: true
    })

    /**
     * Website API.
     */
    public api: API

    /**
    * Website port.
    */
    public port: number

    constructor(port: number = DEFAULT_PORT) {
        super(port)

        ////////////////////////////////////////
        ///////////////  STARTUP  //////////////
        ////////////////////////////////////////
        const logger = this.logger

        const app = express()
        const api = new API(app, port)

        api.init()
        app.use(express.static('./assets'))

        this.port = port
        this.api = api

        app.listen(port, () => {
            const platform = process.platform
            let availableURL: string

            if (platform == 'linux') availableURL = `http://62.109.19.9:${port}`
            else availableURL = `http://localhost:${port}`

            logger.info(`Server is running on port ${port}.`)
            logger.info(`The website is available at ${availableURL}.`)
        })


        ////////////////////////////////////////
        ///////////  PAGES HANDLING  ///////////
        ////////////////////////////////////////

        app.get('*', (req, res) => {
            const url = req.url.slice(1)
            const params = this.parseParams(req.url)

            if (!url) {
                this.logger.sendLog('link', {
                    ip: req.ip,
                    url: '/',
                    statusCode: 200
                })

                return this.sendPage('./assets/main.html', req, res)
            }

            if (pages.removed[url]) return this.sendError(null, req, res, 410)

            if (pages.main[url] && !params) {
                this.logger.sendLog('link', {
                    ip: req.ip,
                    url: '/' + url,
                    statusCode: 200
                })

                return this.sendPage(`./assets/services/${url}.html`, req, res)
            }

            if (pages.admin[url.split('/')[1]] && !params) {
                const cookies = this.parseCookies(req.headers.cookie)

                const email = cookies.email as string
                const account = this.accounts.find({ email })

                if (!account || !account.admin) {
                    this.logger.sendLog('error', {
                        ip: req.ip,
                        url: '/' + url,
                        statusCode: 403
                    })

                    return this.sendError(null, req, res, 403)
                }

                this.logger.sendLog('link', {
                    ip: req.ip,
                    url: '/' + url,
                    statusCode: 200
                })

                return this.sendPage(`./assets/${url}.html`, req, res)
            }

            const splittedURL = url.split('/')
            const service = splittedURL[1]
            const solutionID = Number(splittedURL[2])

            if (pages.main[service] && url.startsWith(`solutions/${service}`)) {
                const solutions = new DatabaseManager(`./data/${service}.json`)
                const solutionList = solutions.fetch(service) || []

                let [solution, solutionIndex] = [
                    solutionList.find((x: any) => x.id == solutionID),
                    solutionList.findIndex((x: any) => x.id == solutionID)
                ]

                let thirdField
                let finalPageScript

                switch (service) {
                    case 'quadratic-equations':
                        thirdField = 'badRatioC'
                        break;

                    case 'number-bases':
                        thirdField = 'badBase2'
                        break;
                }

                if (!solution) return this.sendPage(`./assets/services/${service}.html`, req, res, 404, text => text.replace(
                    `id="${thirdField}"></p>`,
                    `id="${thirdField}">Не удалось найти решение с ID ${solutionID}.</p>`
                ))

                switch (service) {
                    case 'quadratic-equations':
                        finalPageScript = `
                            document.getElementById('ratio_a').value = ${solution.a}
                            document.getElementById('ratio_b').value = ${solution.b}
                            document.getElementById('ratio_c').value = ${solution.c}`
                        break;

                    case 'number-bases':
                        finalPageScript = `
                            document.getElementById('number').value = ${solution.number}
                            document.getElementById('base1').value = ${solution.base1}
                            document.getElementById('base2').value = ${solution.base2}`
                        break;
                }

                solution.solutionClicks = solution.solutionClicks + 1

                solutionList.splice(solutionIndex, 1, solution)
                solutions.set(service, solutionList)

                return this.sendPage(`./assets/services/${service}.html`, req, res, 200, text =>
                    text.replace(`</script> <!-- end -->`,
                        `${finalPageScript}
                        checkParameters()</script>`)
                        .replace(
                            '<br><b>Результат:</b><br>',
                            `<br>ID решения: <b>${solutionID}</b>.<br>Переходов по ссылке: <b>${solution.solutionClicks || 0}</b>.<br><br><b>Результат:</b><br>`
                        ))
            }

            if (params) {
                try {
                    if (params.urlData.url == '/admin/eval') {
                        const tsCode = params.code
                        const code = decodeURIComponent(tsCode)

                        const startTime = Date.now()
                        try {

                            this.logger.sendLog('link', {
                                ip: req.ip,
                                url,
                                statusCode: 200
                            })

                            if ((code.includes('require') && (code.includes('fs') || code.includes('child_process')))) {
                                return this.sendPage('./assets/admin/eval.html', req, res, 200, text => text.replace('id="code"></textarea>', `id="code">${code}</textarea>`).replace('id="result"></textarea>', `id="result">time: ${Date.now() - startTime}ms\ntypeof: null\n\noutput:\n\nOopsie!\nFor security reasons, requiring 'fs' and 'child_process' is disabled right now.</textarea>`))
                            }

                            if (code.includes('process.exit'))
                                throw new TypeError('process.exit is not a function')

                            const evaled = eval(code)
                            const inspected = inspect(evaled)

                            return this.sendPage('./assets/admin/eval.html', req, res, 200, text => text.replace('id="code"></textarea>', `id="code">${code}</textarea>`).replace('id="result"></textarea>', `id="result">time: ${Date.now() - startTime}ms\ntypeof: ${typeof evaled}\n\noutput:\n${inspected}</textarea>`))

                        } catch (err) {

                            this.logger.sendLog('link', {
                                ip: req.ip,
                                url,
                                statusCode: 200
                            })
                            return this.sendPage('./assets/admin/eval.html', req, res, 200, text => text.replace('id="code"></textarea>', `id="code">${code}</textarea>`).replace('id="result"></textarea>', `id="result">time: ${Date.now() - startTime}ms\n\nerror:\n${err.stack}</textarea>`))
                        }
                    }

                    if (params.urlData.url == '/emailVerification') {
                        const { token } = params
                        let code = 200

                        const accountList: UserAccount[] = this.accounts.database.fetch('accounts')
                        const [account, accountIndex]: [UserAccount, number] = [
                            accountList.find(x => x.verificationToken == token) || {} as any,
                            accountList.findIndex(x => x.verificationToken == token)
                        ]

                        if (account.verified) code = 400
                        else if (!account.verificationToken) code = 404
                        else if (!account.authorized) code = 403

                        this.sendPage('./assets/verification.html', req, res, code, text => {
                            if (!account.verificationToken) return text
                                .replace(
                                    '<b id="message"></b>',
                                    '<b id="message" class="errorMessage">Недействительная ссылка активации аккаунта.</b>'
                                )

                            if (account.verified) return text
                                .replace(
                                    '<b id="message"></b>',
                                    '<b id="message" class="errorMessage">Данный аккаунт уже активирован.</b>'
                                )

                            if (!account.authorized) return text
                                .replace(
                                    '<b id="message"></b>',
                                    '<b id="message" class="errorMessage">Войдите в свой аккаунт для его активации.</b>'
                                )

                            account.verificationToken = null
                            account.verified = true

                            accountList.splice(accountIndex, 1, account)
                            this.accounts.database.set('accounts', accountList)

                            this.mailer.send(account.email, {
                                subject: `Активация аккаунта ${account.username} [${account.email}]`,
                                text: 'Спасибо за прохождение активации аккаунта на сайте!',
                                html: `<h1>Активация аккаунта</h1><br>
                                <p>Вы успешно активировали аккаунт <b>${account.username}</b> на сайте ${this.appURL.startsWith('http') ? this.appURL : `http://${this.appURL}`}.</p><br>
                                <p>Спасибо за то, что уделили время активации своего аккаунта!</p><br>

                                <footer style="size: 2px">Это письмо было отправлено автоматически в качестве уведомления. Отвечать на него не нужно.</footer>`,
                            })

                            return text
                                .replace(
                                    '<b id="message"></b>',
                                    '<b id="message" class="successMessage">Аккаунт успешно активирован!</b>'
                                )
                        })
                    }

                    if (params.urlData.url == '/passwordReset') {
                        const { token } = params
                        let code = 200

                        const accountList: UserAccount[] = this.accounts.database.fetch('accounts')

                        const account: UserAccount =
                            accountList.find(x => x.passwordResetToken == token) || {} as any

                        if (!account.passwordResetToken) code = 404

                        this.sendPage('./assets/passwordReset.html', req, res, code, text => {

                            if (!account.passwordResetToken) return text
                                .replace(
                                    '<b id="message"></b>',
                                    '<b id="message" class="errorMessage">Недействительная ссылка сброса пароля аккаунта.</b>'
                                )

                            return text
                                .replace(
                                    '<b id="message"></b>',
                                    `Новый пароль<br>
                                    <input id="newPassword" type="password" placeholder="Новый пароль"><br>
                                    
                                    <b>
                                        <p class="errorMessage" id="incorrectNewPassword"></p>
                                    </b>

                                    Повторите пароль<br>
                                    <input id="repeatedPassword" type="password" placeholder="Пароль"><br><br>

                                    <input type="checkbox" id="showPassword" onclick="showPassword()"> Показать пароль
                                    
                                    <b>
                                        <p class="errorMessage" id="incorrectRepeatedPassword"></p>
                                    </b>

                                    <b>
                                        <p class="successMessage" id="changedSuccessfully"></p>
                                    </b>
                        
                                    <b>
                                        <p class="warningMessage" id="capsEnabled"></p>
                                    </b><br>
                                    <a href="#" class="bigButton" onClick="checkNewPasswordData()">Сменить пароль</a>`
                                )
                        })
                    }

                    if (params.urlData.url == '/api/users/fetch') {
                        const accountParams: Partial<UserAccount> = params
                        delete params.urlData

                        const accounts = this.accounts.fetch(accountParams)

                        if (!accounts.length) return res.status(404).send({
                            code: 404,
                            status: false,

                            message: 'No accounts found with specified parameters.',
                            params: accountParams,

                            results: []
                        })

                        accounts.map(x => {
                            delete x.ip
                            delete x.password

                            delete x.verificationToken
                            delete x.passwordResetToken
                        })

                        return res.status(200).send({
                            code: 200,
                            status: true,

                            message: `Found ${accounts.length} ${accounts.length == 1 ? 'account' : 'accounts'} with specified parameters.`,
                            params: accountParams,

                            results: accounts
                        })
                    }

                } catch (err) {
                    this.sendError(err, req, res)
                }
            }

            if (url.startsWith(API_ENDPOINT.slice(1))) return res.status(404).send({ code: 404, message: 'Not Found!' })
            return this.sendError(null, req, res, 404)
        })
    }
}

export = Server