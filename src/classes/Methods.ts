import { Request, Response } from 'express'
import { existsSync, readdirSync, readFileSync } from 'fs'

import { pages } from '../../Config'

import AccountManager from '../managers/AccountManager'

import AvailableParamsObject from '../interfaces/AvailableParamsObject'
import { DEFAULT_PORT } from '../structures/Constants'

/**
 * Methods class.
 */
class Methods {
    /**
     * Website URL where it can be accessed.
     */
    public appURL: string

    /**
     * Account Manager.
     */
    public accounts = new AccountManager()

    /**
     * the Methods class.
     * @param {Number} port Server port. 
     */
    constructor(port: number = DEFAULT_PORT) {
        const platform = process.platform
        let availableURL: string

        if (platform == 'linux') availableURL = `http://62.109.19.9:${port}`
        else availableURL = `http://localhost:${port}`

        this.appURL = availableURL
    }

    /**
    * Parses the parameters from a URL string.
    * @param {String} url url string.
    * @returns {AvailableParamsObject} Params object.
    */
    parseParams(url: string): AvailableParamsObject {
        if (Array.isArray(url)) {
            let parsedObject = {}

            for (let i of url) {
                const [key, value] = i.split('=')
                parsedObject[key] = value == 'true' || value == 'false' ? JSON.parse(value) : value
            }

            return parsedObject
        }

        if (typeof url == 'string') {
            let parsedObject: AvailableParamsObject = {}
            const params = url.split('?')

            if (!params.slice(1).length) return null

            const parsedArray = params[1].split('&')

            for (let i of parsedArray) {
                const [key, value] = i.split('=')
                parsedObject[key] =
                    value == 'true' || value == 'false'
                        ? JSON.parse(value)
                        : isNaN(value as null) ? value : Number(value)
            }

            const splittedURL = url.split('/')

            parsedObject.urlData = {}
            parsedObject.urlData.url = params[0]

            if (params[0].includes('api/')) parsedObject.urlData.path = './src/api.ts'
            else parsedObject.urlData.path = './assets' + (splittedURL.length < 3 ?
                '/services' + url.split('?')[0] :
                url.split('?')[0]) + '.html'

            return parsedObject
        }

        return null
    }

    /**
     * Sends the specified page to a website.
     * @param {String} path The path to an HTML file.
     * @param {Request} req Express Request.
     * @param {Response} res Express Responce.
     * @param {Number} statusCode The HTTP status code to send.
     * @param {PageCallbackFunction} callback A function that returns the page HTML text.
     * @param {Boolean} checkLoginStatus If true and user is not logged in, the user will be redirected to a login page.
     */
    sendPage(path: string, req: Request, res: Response, statusCode: number = 200, callback?: PageCallbackFunction, checkLoginStatus: boolean = false) {
        try {
            const services: string[] = readdirSync('./assets/services').map(x => x.replace('.html', ''))

            let servicesOptions: string = ''
            let servicesConditions: string = ''

            for (let i in services) {
                servicesOptions += `<option>${pages.main[services[i]]}</option>\n            `
                servicesConditions += `if (option == '${pages.main[services[i]]}') return window.location = '/${services[i]}'\n            `
            }

            this.appURL = req.headers.host

            var menuContent = `
            <script src="/js/jquery.min.js"></script>
            <link href="https://use.fontawesome.com/releases/v5.0.13/css/all.css" rel="stylesheet">
            
            <select id="menu1" class="list" placeholder="Сервисы"> 
            <option>Сервисы</option>
                ${servicesOptions}
            </select>

        <div class="buttons" id="buttons"></div>

        <script>
        
        window.onload = function() {
        const menu = document.getElementById('menu')

        /*
        menu.onchange = function(x) {
            const option = this.options[this.selectedIndex]?.value

            ${servicesConditions}
        }*/
    }
        </script>`

            var emptyHamburger = `<script src="/js/logout.js"></script>
            <section class="top-line h" id="top-line">
        <div class="container-fluid">
            <div class="row">
                <div class="col-md-12" style="padding-right: 0">
                    <div id="hide" class="logo" alt="">
                        <a itemprop="url" tabindex="0" href="./" alt="Logo" title="На главную"><img itemprop="logo"
                                class="hoverable" src="/favicon.ico" alt="logo" id="logoIcon"></a>
                                <!-- <span class="username" id="username"></span> -->
                    </div>
    
                    <div class="menu-head hidden-sm hidden-xs">
                        <nav id="top-menu" itemscope="" itemtype="http://schema.org/SiteNavigationElement">
    
    
                            <ul id="hamburger-buttons">
                                <!-- PC buttons here -->
                            </ul>
                        </nav>
                    </div>
                </div>
    
                <div id="hamburger" class="hamburger-menu">
                    <input id="menu__toggle" type="checkbox" />
                    <label class="menu__btn" for="menu__toggle">
                        <span></span>
                    </label>
                    <ul id="menuBox" class="menu__box">
                        <!-- mobile buttons here -->
                    </ul>
    
                </div>
            </div>
        </div>
    </section>\n\n`

            var footerContent = `<footer>
    <br>
    <p id="copyright"></p>

    <script>document.getElementById('copyright').innerHTML = '&copy ' + new Date().getFullYear() + '<br>Все права защищены.<br><br> '</script>
        </footer>`

            if (!existsSync(path)) return this.sendError(null, req, res, 404)

            let text = readFileSync(path).toString()
                .replace('</head>', `</head>\n\n${emptyHamburger}`)
                .replace('<p class="menu"></p>', `<p class="menu">${menuContent}</p>`)
                .replace('</html>', `${footerContent}\n\n</html>`)

            if (typeof callback == 'function') text = callback(text)
            return res.status(statusCode || 200).send(text)

        } catch (err) {

            if (err.message !== 'Cannot set headers after they are sent to the client') {
                let text = readFileSync('./assets/errors/500.html').toString()
                    .replace('</head>', `</head>\n\n${emptyHamburger}`)
                    .replace('<p class="menu"></p>', `<p class="menu">${menuContent}</p>`)
                    .replace('</html>', `${footerContent}\n\n</html>`)

                this.sendError(err, req, res, 500)
                res.status(500).send(text)
            }
        }
    }

    sendError(err: Error, req: Request, res: Response, statusCode: number = 500, callback?: PageCallbackFunction) {
        if (err) console.error(err)

        this.accounts.logger.sendLog('error', {
            ip: req.ip,
            url: req.url,
            statusCode: 404,
            errorStack: err?.stack || null
        })

        return this.sendPage(`./assets/errors/${statusCode}.html`, req, res, statusCode, callback)
    }
}

/**
 * A function that returns the page HTML text.
 * @param {String} text Page HTML text.
 * @returns {String} Page HTML text.
 */
type PageCallbackFunction = (text: string) => string

export = Methods