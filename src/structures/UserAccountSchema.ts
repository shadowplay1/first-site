import UserAccount from '../interfaces/UserAccount'

const UserAccountSchema: UserAccount = {
    id: 0,
    
    username: '',
    password: '',
    email: '',
    ip: '',

    blocked: false,
    admin: false,

    authorized: true,
    remember: false,

    createdAt: null,
    createdTimestamp: 0
}

export = UserAccountSchema