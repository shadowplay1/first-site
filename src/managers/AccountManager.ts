import DatabaseManager from './DatabaseManager'

import UserAccount from '../interfaces/UserAccount'

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

    constructor() {
        const accounts = this.list()
        if (!Array.isArray(accounts)) this.database.set('accounts', [])
    }

    /**
     * Creates an account. This action is equivalent to an account registration.
     * @param {String} username User's username.
     * @param {String} password User's password.
     * @param {String} ip User's IP.
     * @param {Boolean} remember Should the website remember the user.
     * @param {Boolean} admin Is the user admin.
     * @returns {UserAccount} The user account object.
     */
    create(options: Omit<UserAccount, 'id' | 'blocked' | 'authorized'>): UserAccount {
        const accounts: UserAccount[] = this.database.fetch('accounts')
        const accountObject = { ...UserAccountSchema, ...options }

        const date = new Date()

        accountObject.id = accounts.length ? accounts[accounts.length - 1].id + 1 : 1

        accountObject.createdAt = date
        accountObject.createdTimestamp = this.generateTimestamp(date)

        this.database.push('accounts', accountObject)
        return accountObject
    }

    /**
     * Logs into the account. If the login and password are correct, it sets the account's `authorized` property to true.
     * @param {String} username User's username.
     * @returns {Boolean} If logged in successfully, true will be returned. Otherwise - false.
     */
    login(loginOptions: Pick<UserAccount, 'email' | 'password' | 'ip' | 'remember'>): boolean {
        const { email, password, remember } = loginOptions
        const accounts = this.list()

        const account = this.find({ email, password })
        const accountIndex = this.findIndex({ email, password })

        this.logger.debug('Account index: ' + accountIndex, 'yellow')

        if (!account) return false

        account.authorized = true
        account.ip = ip
        if (remember) account.remember = true

        accounts.splice(accountIndex, 1, account)

        return this.database.set('accounts', accounts)
    }

    /**
     * Logs off the account. Sets the account's `authorized` property to false. It's the opposite to `login()` method.
     * @param {String} email User's email.
     * @param {String} password User's password.
     * @param {String} ip User's IP.
     * @returns {Boolean} If logged out successfully, true will be returned. Otherwise - false.
     */
    logout(email: string, username: string, password: string, ip: string): boolean {
        const accounts = this.list()

        const account = this.find({ email, username, password, ip })
        const accountIndex = this.findIndex({ email, username, password, ip })

        if (!account) return false

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
        return accounts
    }

    /**
    * Finds the account by username, password and IP.
    * @param searchBy The object to find the account.
    * @returns {UserAccount} The user account object.
    */
    find(searchBy: Partial<Pick<UserAccount, 'username' | 'password' | 'email' | 'ip'>>): UserAccount {
        const accounts = this.list()
        const keys = Object.entries(searchBy)

        const account = accounts.find(x => {
            for (let [key, value] of keys) {
                if (x[key] !== value) return false
            }

            return true
        })

        return account || null
    }

    /**
    * Finds all the accounts by username, password and IP.
    * @param searchBy The object to find the account.
    * @returns {UserAccount[]} Array of user account objects.
    */
    findAll(searchBy: Partial<Pick<UserAccount, 'username' | 'password' | 'email' | 'ip'>>): UserAccount[] {
        const accounts = this.list()
        const keys = Object.entries(searchBy)

        const account = accounts.filter(x => {
            for (let [key, value] of keys) {
                if (x[key] !== value) return false
            }

            return true
        })

        return account || null
    }

    /**
    * Finds the account's index by username, password and IP.
    * @param {String} username User's username.
    * @returns {Number} The user account index.
    */
    findIndex(searchBy: Partial<Pick<UserAccount, 'username' | 'password' | 'email' | 'ip'>>): number {
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
    * @param {Partial<UserAccount>} id Account ID.
    * @returns {UserAccount[]} The user account object.
    */
    fetch(searchBy: Partial<UserAccount>): UserAccount[] {
        const accountList = this.list()
        const keys = Object.entries(searchBy)
        //console.log('searching in:', accountList);


        const accounts = accountList.filter(x => {
            for (let [key, value] of keys) {
                if (key == 'password') value = String(value)
                if (x[key] !== value) return false
            }

            return true
        })

        return accounts
    }

    /**
     * Finds the account by it's ID.
     * @param {String | Number} id Account ID.
     * @returns {UserAccount} The user account object.
     */
    get(id: string | number): UserAccount {
        const accounts = this.list()
        const account = accounts.find(x => x.id == id)

        if (!id) return null
        if (!account) return null

        return account
    }

    /**
    * Finds the account's index by it's ID.
    * @param {String | Number} id Account ID.
    * @returns {Number} The user account index.
    */
    getIndex(id: string | number): number {
        const accounts = this.list()
        const accountIndex = accounts.findIndex(x => x.id == id)

        if (!id) return null
        return accountIndex
    }
}

export = AccountManager