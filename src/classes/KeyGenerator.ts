class Generator {
    /**
    * Generates a key for anything.
    * @param {Number} length The length of the key.
    * @param {Boolean} includeDots Will the dots be included in the key.
    * @returns {String} The generated key.
    */
    generateKey(length?: number, includeDots?: boolean): string

    /**
    * Generates a key for anything.
    * @param {Number} length The length of the key.
    * @returns {String} The generated key.
    */
    generateKey(length?: number): string

    /**
    * Generates a key for anything.
    * @returns {String} The generated key.
    */
    generateKey(): string
    generateKey(length: number = 32, includeDots: boolean = true): string {
        const allSymbols = 'q1dw3er2t1y.u7io.p4a0s105df8g4.h1jk9l6d82d9hz7x8v0.b9n6m0d612n3d45.67ju0kl89a0.qtry5io25u2f24nw'.split('')
        const symbols = includeDots ? allSymbols : allSymbols.filter(x => x !== '.')
        
        let key = ''

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