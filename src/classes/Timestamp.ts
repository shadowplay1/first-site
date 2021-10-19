class Timestamp {
    /**
    * Creates a timestamp value of the date.
    * @param {Date} date The date to create a timestamp for.
    */
    generateTimestamp(date: Date): number

    /**
     * Creates a timestamp value of the date.
     * @param {String} date The date to create a timestamp for.
     */
    generateTimestamp(date: string): number
    generateTimestamp(date: Date | string): number {
        return Math.floor(new Date(date).getTime() / 1000)
    }
}

export = Timestamp