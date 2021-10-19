interface AvailableParamsObject {

    ////////////////////////////////////////
    ////////////  ACCOUNT DATA  ////////////
    ////////////////////////////////////////


    /**
     * User's ID.
     */
    id?: number

    /**
    * User's ID.
    */
    email?: string

    /**
     * User's username.
     */
    username?: string

    /**
    * User's password.
    */
    password?: string

    /**
    * Should the website remember the user.
    */
    rememberMe?: boolean



    ////////////////////////////////////////
    /////////   PARAMS TO ENCODE   /////////
    /////////   AND ENCODE IN URI  /////////
    ////////////////////////////////////////


    /**
    * Any link to the website.
    */
    link?: string

    /**
     * A TypeScript code to run through the server.
     */
    code?: string


    ////////////////////////////////////////
    //////////////  CONSTANTS  /////////////
    ////////////////////////////////////////

    /**
     * URL data object.
     */
    urlData?: {

        /**
         * URL string.
         */
        url?: string

        /**
         * Path to the page on the website.
         */
        path?: string
    }
}

export = AvailableParamsObject