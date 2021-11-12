import DatabaseManager from './DatabaseManager'

import UserAccount from '../classes/UserAccount'
import AccountMethods from '../interfaces/AccountMethods'

import UserAccountSchema, { ip } from '../structures/UserAccountSchema'

import Logger from '../classes/Logger'
import Timestamp from '../classes/Timestamp'

/**
 * Account Manager.
*/
class AccountManager {
    public database = new DatabaseManager('./data/accounts.json')
    public logger = new Logger({
        colorized: true
    })

    private generateTimestamp = new Timestamp().generateTimestamp

    /**
    * Account Manager.
    */
    constructor() {
        const accounts = this.list()
        if (!Array.isArray(accounts)) this.database.set('accounts', [])
    }
    /**
     * Creates an account. This action is equivalent to the account registration.
     * @param {String} options Account creating options.
     * @returns {UserAccount} The user account object.
     */
    create(options: Omit<UserAccount, AccountMethods | 'id' | 'blocked' | 'authorized'>): UserAccount {
        const accounts: UserAccount[] = this.database.fetch('accounts')
        const accountObject = { ...UserAccountSchema, ...options }

        const date = new Date()

        accountObject.id = accounts.length ? accounts[accounts.length - 1].id + 1 : 1

        accountObject.createdAt = date
        accountObject.createdTimestamp = this.generateTimestamp(date)

        accountObject.verified = options.verified || false

        this.database.push('accounts', accountObject)

        const account = new UserAccount(accountObject)
        return account
    }

    /**
     * Logs into the account. 
     * 
     * If the login and password are correct, 
     * it sets the account's `authorized` property to 'true'.
     * 
     * @param {String} loginOptions Login options object.
     * @returns {Boolean} If logged in successfully, 'true' will be returned. Otherwise - 'false'.
     */
    login(loginOptions: Pick<UserAccount, 'email' | 'password'>): boolean {
        const { email, password } = loginOptions
        const accounts = this.list()

        const account = this.find({ email, password })
        const accountIndex = this.findIndex({ email, password })

        this.logger.debug('Account index: ' + accountIndex, 'yellow')

        if (!account) return false

        account.authorized = true
        account.ip = ip

        accounts.splice(accountIndex, 1, account)
        return this.database.set('accounts', accounts)
    }

    /**
     * Logs off the account. 
     * 
     * Sets the account's `authorized` property to false. 
     * It's the opposite to `login()` method.
     * 
     * @param {String} email User's email.
     * @param {String} password User's password.
     * @param {String} ip User's IP.
     * @returns {Boolean} If logged out successfully, true will be returned. Otherwise - false.
     */
    logout(email: string, username: string, password: string, ip: string): boolean {
        const accounts = this.list()

        const account = this.find({ email, username, password })
        const accountIndex = this.findIndex({ email, username, password })

        if (!account) return false

        this.logger.sendLog('logout', {
            ip,
            url: null,

            login: {
                email,
                username,
                password
            }
        })

        account.authorized = false
        accounts.splice(accountIndex, 1, account)

        return this.database.set('accounts', accounts)
    }

    /**
     * Gets the list of the accounts.
     * @returns {UserAccount[]} User accounts list.
     */
    list(): UserAccount[] {
        const accounts: UserAccount[] = this.database.fetch('accounts')
        const accountList = accounts.map(x => new UserAccount(x))

        return accountList
    }

    /**
    * Finds the account by any specified account properties.
    * @param {Partial<Omit<UserAccount, AccountMethods>>} searchBy The object to find the account.
    * @returns {UserAccount} The user account object.
    */
    find(searchBy: Partial<Omit<UserAccount, AccountMethods>>): UserAccount {
        const accounts = this.list()
        const keys = Object.entries(searchBy)

        const account = accounts.find(x => {
            for (let [key, value] of keys) {
                if (x[key] !== value) return false
            }

            return true
        })

        if (!account?.email) return null

        const userAccount = new UserAccount(account)
        return userAccount
    }

    /**
    * Finds the account's index by username, password and IP.
    * @param {Partial<Omit<UserAccount, AccountMethods>>} searchBy Account options object.
    * @returns {Number} The user account index.
    */
    findIndex(searchBy: Partial<Omit<UserAccount, AccountMethods>>): number {
        const accounts = this.list()
        const keys = Object.entries(searchBy)

        const accountIndex = accounts.findIndex(x => {
            for (let [key, value] of keys) {
                if (x[key] !== value) return false
            }

            return true
        })

        return accountIndex
    }

    /**
    * Finds the accounts by any specified account properties.
    * @param {Partial<UserAccount>} searchBy Account options object.
    * @returns {UserAccount[]} The user account object.
    */
    fetch(searchBy: Partial<Omit<UserAccount, AccountMethods>>): UserAccount[] {
        const accountList = this.list()
        const keys = Object.entries(searchBy)

        const accounts = accountList.filter(x => {
            for (let [key, value] of keys) {
                if (key == 'password') value = String(value)
                if (x[key] !== value) return false
            }

            return true
        }).map(x => new UserAccount(x))

        return accounts
    }
}

export = AccountManager