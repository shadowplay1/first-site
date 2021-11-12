import UserAccount from '../classes/UserAccount'
import AccountMethods from '../interfaces/AccountMethods'

const UserAccountSchema: Omit<UserAccount, AccountMethods> = {
    id: 0,
    
    username: '',
    password: '',
    email: '',
    ip: '',

    verified: false,
    blocked: false,
    admin: false,

    authorized: true,

    createdAt: null,
    createdTimestamp: 0,

    verificationToken: null,
    passwordResetToken: null
}

export = UserAccountSchema