
/**
 * Loads the navigation buttons on the top line.
 * @param {Button[]} buttons The buttons array.
 */
function loadButtons(buttons) {
    if (!buttons) {
        console.error('No buttons were specified to load. Loaded only theme button.')

        buttons = [{
            text: 'Светлая',
            icon: 'fas fa-sun',
            id: 'themeButtonPC',
            mobileID: 'themeButtonMobile',
            onClick: 'changeTheme()',
        }]
    }

    setTimeout(() => {
        // setting buttons for mobile menu
        document.getElementById('menuBox').innerHTML = `${buttons
            .map(x => `<li><a class="menu__item" ${x.href ? `href="${x.href}"` : ''} ${x.mobileID ? `name="${x.mobileID}"` : ''} ${x.onClick ? `onclick="${x.onClick}"` : 'onclick="() => {}"'} ${x.style ? `style="${x.style}"` : ''}"><i class="${x.icon}"> </i> ${x.text}</a></li>`)
            .join('                                \n')}`

        // setting buttons for PC menu
        document.getElementById('hamburger-buttons').innerHTML = `${buttons
            .map(x =>
                `<li itemprop="name"><a itemprop="url" tabindex="0" class="hoverable" ${x.href ? `href="${x.href}"` : ''} name=${x.id} ${x.onClick ? `onClick="${x.onClick}" id="hamburgerButton"` : 'onClick="() => {}" id="hamburgerButton"'} ${x.style ? `style="${x.style}"` : ''}">
                            <i class="${x.icon}"></i> ${x.text}
                        </a>
                    </li>`
            )
            .join('\n')}`

        const themeButtons = [document.getElementByID('themeButtonPC'), document.getElementByID('themeButtonMobile')]

        if (!theme) {
            localStorage.theme = 'light'
            themeButtons.map(x => x.innerHTML = '<i class="fas fa-sun"></i> Светлая')
        } else {
            themeButtons.map(x => x.innerHTML = theme == 'light' ? '<i class="fas fa-moon"></i> Тёмная' : '<i class="fas fa-sun"></i> Светлая')
        }
    }, 100)
}