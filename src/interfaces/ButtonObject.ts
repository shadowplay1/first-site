interface ButtonObject {

    /**
     * Text of the button.
     */
    text: string

    /**
     * The "href" button attribute.
     */
    href?: string

    /**
     * Type of the button. 
     */
    type: 'button' | 'bigButton' | 'button1' | 'redButton'

    /**
    * The "id" button attribute. 
    */
    id?: string

    /**
    * The "onclick" button attribute. 
    */
    onClick?: string
}

export = ButtonObject