import { writeFileSync } from 'fs'
import FetchManager from '../managers/FetchManager'

/**
 * Dot parser class.
 * @private
 */
class DotParser {
    /**
    * Storage Path.
    */
    public storagePath: string

    /**
    * Fetch Manager.
    */
    public fetcher: FetchManager

    /**
     * DotParser class.
     * @param {String} storagePath Full path to a JSON file.
     */
    constructor(storagePath: string) {
        this.storagePath = storagePath
        this.fetcher = new FetchManager(storagePath)
    }

    /**
     * Parses the key and fetches the value from database.
     * @param {String} key The key in database.
     * @returns {any | false} The data from database or 'false' if failed to parse or 'null' if nothing found.
     */
    parse(key: string): any | false {
        let parsed = this.fetcher.fetchAll()

        if (!key) return false
        if (typeof key !== 'string') return false

        const keys = key.split('.')
        let tmp = parsed

        for (let i = 0; i < keys.length; i++) {
            if ((keys.length - 1) == i) {
                parsed = tmp?.[keys[i]] || null
            }

            tmp = tmp?.[keys[i]]
        }

        return parsed || null
    }

    /**
     * Parses the key and sets the data in database.
     * @param {String} key The key in database.
     * @param {any} value Any data to set.
     * @returns {Boolean} If set successfully: true; else: false
     */
    set(key: string, value: any): boolean {
        const { isObject } = this
        let storageData = this.fetcher.fetchAll()

        if (!key) return false
        if (typeof key !== 'string') return false

        if (value == undefined) return false
        if (typeof value == 'function') return false


        const keys = key.split('.')
        let tmp = storageData

        for (let i = 0; i < keys.length; i++) {

            if ((keys.length - 1) == i) {
                tmp[keys[i]] = value

            } else if (!isObject(tmp[keys[i]])) {
                tmp[keys[i]] = {}
            }

            tmp = tmp?.[keys[i]]
        }

        writeFileSync(this.storagePath, JSON.stringify(storageData, null, '\t'))

        return true
    }

    /**
     * Parses the key and removes the data from database. 
     * @param {String} key The key in database.
     * @returns {Boolean} If removed successfully: true; else: false
     */
    remove(key: string): boolean {
        const { isObject } = this
        let storageData = this.fetcher.fetchAll()

        if (!key) return false
        if (typeof key !== 'string') return false

        const data = this.parse(key)
        if (data == null) return false

        const keys = key.split('.')
        let tmp = storageData

        for (let i = 0; i < keys.length; i++) {
            if ((keys.length - 1) == i) {
                delete tmp?.[keys[i]]

            } else if (!isObject(tmp?.[keys[i]])) {
                tmp[keys[i]] = {}
            }

            tmp = tmp[keys[i]]
        }

        writeFileSync(this.storagePath, JSON.stringify(storageData, null, '\t'))

        return true
    }

    /**
     * Checks for is the item object and returns it.
     * @param {any} item The item to check.
     * @returns {Boolean} Is the item object or not.
    */
    isObject(item: any): boolean {
        return !Array.isArray(item)
            && typeof item == 'object'
            && item !== null
    }
}

export = DotParser