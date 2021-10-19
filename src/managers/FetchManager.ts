import { existsSync, readFileSync, writeFileSync } from 'fs'

/**
 * Fetch Manager.
 */
class FetchManager {
    public storagePath: string

    constructor(storagePath: string) {
        this.storagePath = storagePath
    }

    /**
    * Fetches the entire database.
    * @returns {Object} Database contents
    */
    fetchAll(): object {
        const isFileExisting = existsSync(this.storagePath)

        if (!isFileExisting) writeFileSync(this.storagePath, '{}')

        const fileData = readFileSync(this.storagePath)
        const stringData = fileData.toString()

        return JSON.parse(stringData)
    }
}

export = FetchManager