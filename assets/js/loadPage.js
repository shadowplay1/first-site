let loaded = false

/**
 * Returns a reference to the first object with the specified value of the ID or NAME attributess.
 * @param {String} elementID String that specifies the ID value.
 * @returns An HTML element.
 */
document.getElementByID = function (elementID) {
    return document.getElementsByName(elementID)[0] || document.getElementById(elementID) || null
}

NProgress.start()
let i = 1

/**
 * @type {Button[]}
 */
let buttons = [
    {
        text: 'Светлая',
        icon: 'fas fa-sun',
        id: 'themeButtonPC',
        mobileID: 'themeButtonMobile',
        onClick: 'changeTheme()',
    }
]

const theme = localStorage.theme

if (!theme) localStorage.theme = 'light'
else if (theme == 'dark') document.body.classList.toggle('dark')

window.addEventListener('load', () => {
    const accountDataString = localStorage.accountData;

    /**
     * @type {AccountData}
     */
    const accountData = accountDataString ? JSON.parse(accountDataString) : undefined

    /**
     * @type {Button[]}
     */
    const accountButtons = [
        {
            text: 'Настройки аккаунта',
            icon: 'fas fa-shield-alt',
            onClick: 'window.location = \'/account\''
        },
        {
            text: 'Выход',
            icon: 'fas fa-door-open',
            onClick: 'logout()'
        }
    ]

    if (accountData) {
        fetch(`/api/users/fetch?id=${accountData.id}&email=${accountData.email}&password=${accountData.password}`, {
            method: 'GET'
        }).then(x => x.json()).then(res => {

            /**
             * @type {{
             * code: number, 
             * status: boolean, 
             * message: string,
             * results: AccountData[]
             * }}
             */
            const x = res
            const account = x.results[0]

            if (!accountData.remember) {
                buttons.push({
                    text: 'Вход',
                    icon: 'fas fa-door-open',
                    href: '/login'
                },
                    {
                        text: 'Регистрация',
                        icon: 'fas fa-sign-in-alt',
                        href: '/register'
                    })

                logout()
                
                delete localStorage.accountData
                return
            }

            if (!x.status) {
                buttons.push({
                    text: 'Вход',
                    icon: 'fas fa-door-open',
                    href: '/login'
                },
                    {
                        text: 'Регистрация',
                        icon: 'fas fa-sign-in-alt',
                        href: '/register'
                    })

                delete localStorage.accountData
                return
            }

            buttons.unshift({
                text: account.verified ? accountData.username : accountData.username + ' | Не подтверждён',
                icon: 'fas fa-user',
                style: 'cursor: default'
            })
            for (let i of accountButtons) buttons.push(i)

            console.log(`[Auth] Logged in as ${account.username} [${account.email}] (${account.verified ? 'Verified' : 'Unverified'})`);
        }).catch(err => {
            console.warn(`[Auth] Failed to check the authorization status: ${err}`)
        })
    } else {
        buttons.push({
            text: 'Вход',
            icon: 'fas fa-door-open',
            href: '/login'
        },
            {
                text: 'Регистрация',
                icon: 'fas fa-sign-in-alt',
                href: '/register'
            })

        console.log('[Auth] The user is not authorized on the website.')
    }

    loadButtons(buttons)
})

function changeTheme() {
    NProgress.start()

    const themeButtons = [document.getElementByID('themeButtonPC'), document.getElementByID('themeButtonMobile')]
    const isLight = !document.body.classList.contains('dark')

    const themes = !isLight ? 'light' : 'dark'

    document.body.classList.toggle('dark')

    themeButtons.map(x => x.innerHTML = isLight ? '<i class="fas fa-sun"></i> Светлая' : '<i class="fas fa-moon"></i> Тёмная')
    localStorage.theme = themes

    NProgress.done()
}

loaded = true
NProgress.done()

/**
* @typedef Button
* @property {String} text
* @property {String} href
* @property {String} icon
* @property {String} id
* @property {String} mobileID
* @property {String} onClick
* @property {String} style
*/

/**
 * @typedef AccountData
 * @property {Number} id
 * @property {String} username
 * @property {String} email
 * @property {String} password
 * @property {Boolean} remember
 * @property {Boolean} authorized
 * @property {Boolean} verified
 */