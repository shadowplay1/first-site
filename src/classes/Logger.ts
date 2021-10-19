import { inspect } from 'util'

import DatabaseManager from '../managers/DatabaseManager'

import Colors from '../interfaces/Colors'
import Color from '../interfaces/Color'

const date = new Date().toLocaleString('ru')

/**
 * The Logger class.
 */
class Logger {

    /**
    * Logger options object.
    */
    public options: LoggerOptions

    /**
     * Colors object.
     */
    public colors: Colors

    /**
    * Database Manager.
    */
    public database = new DatabaseManager('./data/logs.json')

    /**
     * The Logger class.
     * @param {LoggerOptions} options Logger options object.
     * @param {Boolean} options.colorized Set 'true' if you want to see colorized logs in your console.
     */
    constructor(options: LoggerOptions) {
        this.options = options

        /**
         * Colors object.
         */
        this.colors = {
            black: '\x1b[30m',
            red: '\x1b[31m',
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m',
            magenta: '\x1b[35m',
            cyan: '\x1b[36m',
            lightgray: '\x1b[37m',
            default: '\x1b[39m',
            darkgray: '\x1b[90m',
            lightred: '\x1b[91m',
            lightgreen: '\x1b[92m',
            lightyellow: '\x1b[93m',
            lightblue: '\x1b[94m',
            lightmagenta: '\x1b[95m',
            lightcyan: '\x1b[96m',
            white: '\x1b[97m',
            reset: '\x1b[0m'
        }

        const logs = this.get()
        if (!Array.isArray(logs)) this.database.set('logs', [])
    }

    /**
     * Gets the full list of website logs.
     */
    get() {
        return this.database.fetch('logs')
    }

    /**
     * Saves the log in database once the specified event is happened.
     * @param {RequestType} type The type of the log.
     * @param {LoggingOptions} options Log's sending options.
     * @returns {Boolean} If the log sent successfuly, true will be returned. Otherwise - false.
     */
    sendLog(type: RequestType, options: LoggingOptions): boolean {
        const date = new Date().toLocaleString('ru')
        const ip = options.ip.replace('::1', '127.0.0.1')

        /**
         * @param {String} pretty Log message.
         * @param {Boolean} otherMessage If true, the log message will be used from the first argument of this function.
         * @returns {Boolean} Log status.
        */
        const log = (pretty: string, otherMessage?: boolean): boolean => {
            if (!type) return false
            if (!pretty) return false

            return this.database.push('logs', {
                type,
                username: options.username || null,
                ip: options.ip,
                date,
                data: options,
                pretty: otherMessage ? pretty : `Пользователь с IP ${ip} ${pretty}`
            })
        }

        switch (type) {
            case 'link':
                if (options.url.startsWith('api')) return

                log(`перешёл на страницу ${options.url}`)
                break

            case 'error':
                log(`перешёл на страницу ${options.url} и получил статус код ${options.statusCode}`)
                break

            case 'loginFailed':
                log(`попытался войти под аккаунтом с почтой ${options.login.email} и паролем ${options.login.password}, но данные оказались неверны`)
                break


            case 'register':
                log(`зарегестрировал аккаунт ${options.registration.email} [${options.registration.username}] с паролем ${options.registration.password}`)
                break

            case 'login':
                log(`вошёл в аккаунт ${options.login.email} [${options.login.username}] и паролем ${options.login.password}`)
                break

            case 'logout':
                log(`вышел из аккаунта ${options.login.email} [${options.login.username}] и паролем ${options.login.password}`)
                break


            case 'changeUsername':
                log(`сменил имя пользователя с ${options.changedUsername.oldUsername} на ${options.changedUsername.newUsername}`)
                break

            case 'changePassword':
                log(`сменил пароль с ${options.changedPassword.oldPassword} на ${options.changedPassword.oldPassword}`)
                break

            case 'removeAccount':
                log(`удалил свой аккаунт ${options.removeAccount.username}`)
                break


            case 'blockIP':
                log(`был заблокирован по причине "${options.blockIP.reason}"`)
                break

            case 'unblockIP':
                log(`был разблокирован  по причине "${options.blockIP.reason}"`)
                break

            case 'blockedIP':
                log(`попытался перейти на страницу ${options.url}, но он заблокирован по причине "${options.blockIP.reason}"`)
                break



            case 'blockIP':
                log(`был заблокирован по причине "${options.blockAccount.reason}"`)
                break

            case 'unblockIP':
                log(`был разблокирован`)
                break

            case 'blockedIP':
                log(`попытался перейти на страницу ${options.url}, но он заблокирован по причине "${options.blockAccount.reason}"`)
                break


            case 'badActivity':
                log(`От пользователя с IP ${ip} была обнаружена подозрительная активность.${options.login ? ` Аккаунт пользователя: email: ${options.login.email || 'Почта неизвестна'}, username: ${options.login.username}, password: ${options.login.password}` : ''}`, true)
                break
        }

        return true
    }

    /**
     * Sends a white-colored log in the console.
     * @param {String} content The message to send.
     */
    log(content: string) {
        if (this.options.colorized) return console.log(`${this.colors.white}[Log   | ${date}] ${content}${this.colors.reset}`)
        console.log(`[Log   | ${date}] ${content}`)
    }

    /**
     * Sends a log with a specified color in the console.
     * @param {Color} color The color to set.
     * @param {String} content The message to send.
     * @returns {Boolean} If sent successfully, true will be returned, otherwise - false.
     */
    coloredLog(color: Color, content: string): boolean {
        if (!this.colors[color]) return false

        if (this.options.colorized) console.log(`${this.colors[color]}[Log   | ${date}] ${content}${this.colors.reset}`)
        else console.log(`[Log   | ${date}] ${content}`)

        return true
    }

    /**
    * Sends a log with a specified color in the console.
    * @param {Color} color The color to set.
    * @param {String} content The message to send.
    * @returns {Boolean} If sent successfully, true will be returned, otherwise - false.
    */
    debug(content: any, color: Color = 'yellow'): boolean {
        if (!this.colors[color]) return false

        if (this.options.colorized) console.log(`${this.colors[color]}[Debug | ${date}] ${inspect(content)}${this.colors.reset}`)
        else console.log(`[Debug | ${date}] ${inspect(content)}`)

        return true
    }

    /**
     * Sends a blue-colored info message in the console.
     * @param {String} content The message to send.
     */
    info(content: string) {
        if (this.options.colorized) return console.log(`${this.colors.lightcyan}[Info  | ${date}] ${content}${this.colors.reset}`)
        console.log(`[Info  | ${date}] ${content}`)
    }

    /**
     * Sends a yellow-colored warning message in the console.
     * @param {String} content The message to send.
     */
    warn(content: string) {
        if (this.options.colorized) return console.log(`${this.colors.lightyellow}[Warn  | ${date}] ${content}${this.colors.reset}`)
        console.log(`[Warn  | ${date}] ${content}`)
    }

    /**
     * Sends a red-colored error message in the console.
     * @param {String} content The message to send.
     */
    error(content: string) {
        if (this.options.colorized) return console.log(`${this.colors.lightred}[Error | ${date}] ${content}${this.colors.reset}`)
        console.log(`[Error | ${date}] ${content}`)
    }
}

interface LoggerOptions {

    /**
     * Is the console will be colorized.
     */
    colorized: boolean
}

type RequestType = 'link' | 'error' | 'loginFailed' |
    'register' | 'login' | 'logout' |
    'changeUsername' | 'changePassword' | 'removeAccount' |
    'blockIP' | 'unblockIP' | 'blockedIP' |
    'blockAccount' | 'unblockAccount' | 'blockedAccount' |
    'badActivity'

interface LoggingOptions {

    ////////////////////////////////////////
    ////////   MAIN REQUEST DATA   /////////
    ////////////////////////////////////////

    /**
     * User's username that performed the action.
     */
    username?: string

    /**
     * User's IP that performed the action.
     */
    ip: string

    /**
     * Website URL that user is visited.
     */
    url: string

    /**
     * The status code that user has received on visiting the page.
     */
    statusCode?: number

    /**
     * The stack of the error if it's existing.
     */
    errorStack?: string


    ////////////////////////////////////////
    //////////   BLACKLIST DATA   //////////
    ////////////////////////////////////////

    /**
     * User's IP block info.
     */
    blockIP?: {

        /**
         * Reason of user's block.
         */
        reason?: string
    }

    /**
    * User's account block info.
    */
    blockAccount?: {

        /**
         * User's username
         */
        username: string

        /**
         * Reason of user's block.
         */
        reason?: string
    }


    ////////////////////////////////////////
    ////////////   OTHER DATA   ////////////
    ////////////////////////////////////////

    removeAccount?: {

        /**
         * User's username.
         */
        username: string
    }

    /**
     * Registrated account data.
     */
    registration?: {

        /**
         * Account username.
         */
        username?: string

        /**
         * Account email.
         */
        email?: string,

        /**
         * Account password.
        */
        password?: string
    }

    /**
     * Data of the account that user logged in.
    */
    login?: {

        /**
         * Account username.
         */
        username?: string,

        /**
        * Account email.
        */
        email?: string,

        /**
         * Account password.
        */
        password?: string
    }

    /**
     * New username data.
     */
    changedUsername?: {

        /**
         * Old username.
         */
        oldUsername: string,

        /**
         * New username.
         */
        newUsername: string
    }

    /**
    * New password data.
    */
    changedPassword?: {

        /**
         * Old password.
         */
        oldPassword: string,

        /**
        * New password.
        */
        newPassword: string
    }

}

export = Logger