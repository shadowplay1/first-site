interface UserAccount {

    /**
     * Account ID.
     */
    id: number

    /**
     * User's email.
     */
    email: string

    /**
     * User's username.
     */
    username: string

    /**
     * User's password.
     */
    password: string

    /**
     * User's IP.
     */
    ip: string

    /**
     * Is the user blocked.
     */
    blocked: boolean

    /**
     * Is the user admin.
     */
    admin: boolean

    /**
     * Is the user logged in or not.
     */
    authorized: boolean

    /**
     * Should the website remember the user.
     */
    remember: boolean

    /**
     * User's registration date.
     */
    createdAt: Date

    /**
     * User's registration timestamp.
     */
    createdTimestamp: number
}

export = UserAccount