class Generator {
    /**
    * Generates an API key for this website.
    * @param {Number} length The length of the key.
    * @returns {String} The generated API key.
    */
    generateKey(length?: number): string

    /**
    * Generates an API key for this website.
    * @returns {String} The generated API key.
    */
    generateKey(): String
    generateKey(length: number = 32): string {
        const symbols = 'q1dw3er2t1y.u7io.p4a0s105df8g4.h1jk9l6d82d9hz7x8v0.b9n6m0d612n3d45.67ju0kl89a0.qtry5io25u2f24nw'.split('')
        let key: string = ''

        for (let i = 0; i < length; i++) key += symbols[Math.floor(Math.random() * symbols.length)]
        
        if (key.endsWith('.')) key = key.slice(0, -1) + symbols[Math.floor(Math.random() * symbols.length)]
        if (key.includes('..')) key = key.replaceAll('..',
            symbols[Math.floor(Math.random() * symbols.length)] +
            symbols[Math.floor(Math.random() * symbols.length)]
        )

        return key
    }
}

export = Generator