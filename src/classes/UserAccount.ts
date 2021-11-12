import Mail from 'nodemailer/lib/mailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'

import DatabaseManager from '../managers/DatabaseManager'

import AccountMethods from '../interfaces/AccountMethods'

import Email from './Email'

const database = new DatabaseManager('./data/accounts.json')
const mailer = new Email()

/**
 * User Account class.
 */
class UserAccount {

    /**
     * Account ID.
     */
    public id: number

    /**
     * User's email.
     */
    public email: string

    /**
     * User's username.
     */
    public username: string

    /**
     * User's password.
     */
    public password: string

    /**
     * User's IP.
     */
    public ip: string

    /**
     * Is the account verified.
     */
    public verified?: boolean

    /**
     * Is the user blocked.
     */
    public blocked: boolean

    /**
     * Is the user admin.
     */
    public admin: boolean

    /**
     * Is the user logged in or not.
     */
    public authorized: boolean

    /**
     * User's registration date.
     */
    public createdAt?: Date

    /**
     * User's registration timestamp.
     */
    public createdTimestamp?: number

    /**
    * User's token to activate their account.
    */
    public verificationToken?: string

    /**
    * User's token to reset the password in their account.
    */
    public passwordResetToken?: string

    constructor(options: Omit<UserAccount, AccountMethods> = {} as Omit<UserAccount, AccountMethods>) {
        for (let [key, value] of Object.entries(options)) {
            this[key] = value
        }
    }
    /**
     * Blocks the user.
     * @param {String} reason The reason to block.
     * @returns {Boolean} If blocked, true will be returned. Otherwise - false.
     */
    public block(reason?: string): boolean {
        // todo: blocking users

        return true
    }

    /**
    * Unblocks the user.
    * @param {String} reason The reason to block.
    * @returns {Boolean} If unblocked, true will be returned. Otherwise - false.
    */
    public unblock(): boolean {
        // todo: unblocking users

        return true
    }

    /**
     * Deletes the account.
     * @returns {UserAccount} User's removed account object.
     */
    public delete(): UserAccount {
        return
    }

    sendEmail(contentOptions: Required<Pick<Mail.Options, 'subject' | 'text' | 'html'>>) {
        return mailer.send(this.email, contentOptions)
    }

    /**
     * Changes the user's account email.
     * @param {String} email New email.
     * @returns {UserAccount} User's account object.
     */
    public changeEmail(email: string): UserAccount {
        return this.edit({ email })
    }

    /**
     * Changes the user's account username.
     * @param {String} username New username.
     * @returns {UserAccount} User's account object.
     */
    public changeUsername(username: string): UserAccount {
        return this.edit({ username })
    }

    /**
     * Changes the user's account password.
     * @param {String} password New password.
     * @returns {UserAccount} User's account object.
     */
    public changePassword(password: string): UserAccount {
        return this.edit({ password })
    }

    /**
     * Edits the user's account data.
     * @param {Partial<Omit<UserAccount, AccountMethods>>} accountOptions Account options to edit.
     * @returns {UserAccount} Edited user's account object.
     */
    public edit(accountOptions: Partial<Omit<UserAccount, AccountMethods>>): UserAccount {
        const accounts: UserAccount[] = database.fetch('accounts')

        const account = this
        const accountIndex = accounts.findIndex(x => x.email == account.email)

        for (let [key, value] of Object.entries(accountOptions)) {
            account[key] = value
        }

        accounts.splice(accountIndex, 1, account)
        database.set('accounts', accounts)

        return account
    }


    /**
     * Returns a string representation of a user account.
     * @returns {String} String representation of a user account.
     */
    toString(): string {
        return `${this.username} [${this.email}]`
    }
}

export = UserAccount