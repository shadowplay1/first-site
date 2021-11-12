function checkRegisterData() {
    const successfulyCreated = document.getElementById('successfulyCreated')

    const email = document.getElementById('email').value
    const username = document.getElementById('username').value

    const password = document.getElementById('password').value
    const repeatedPassword = document.getElementById('repeatedPassword').value


    const incorrectEmail = document.getElementById('incorrectEmail')
    const incorrectUsername = document.getElementById('incorrectUsername')

    const incorrectPassword = document.getElementById('incorrectUsername')
    const incorrectRepeatedPassword = document.getElementById('incorrectRepeatedPassword')

    NProgress.start()


    if (!email) {
        incorrectEmail.textContent = 'Укажите почту.'
        NProgress.done()
        return
    } else incorrectEmail.textContent = ''

    if (!isEmail(email)) {
        incorrectEmail.textContent = 'Укажите действительную почту.'
        NProgress.done()
        return
    } else incorrectEmail.textContent = ''


    if (!username) {
        incorrectUsername.textContent = 'Укажите имя пользователя.'
        NProgress.done()
        return
    } else incorrectUsername.textContent = ''

    if (username.length < 3) {
        incorrectUsername.textContent = 'Длина имени пользователя должна быть больше 3 символов.'
        NProgress.done()
        return
    } else incorrectUsername.textContent = ''

    if (username.length > 32) {
        incorrectUsername.textContent = 'Длина имени пользователя должна быть меньше 32 символов.'
        NProgress.done()
        return
    } else incorrectUsername.textContent = ''


    if (!password) {
        incorrectPassword.textContent = 'Укажите пароль.'
        NProgress.done()
        return
    } else incorrectPassword.textContent = ''

    if (password.length < 3) {
        incorrectPassword.textContent = 'Длина пароля должна быть больше 3 символов.'
        NProgress.done()
        return
    } else incorrectPassword.textContent = ''

    if (password.length > 32) {
        incorrectPassword.textContent = 'Длина пароля должна быть меньше 32 символов.'
        NProgress.done()
        return
    } else incorrectPassword.textContent = ''


    if (!repeatedPassword) {
        incorrectRepeatedPassword.textContent = 'Повторите пароль.'
        NProgress.done()
        return
    } else incorrectRepeatedPassword.textContent = ''

    if (password !== repeatedPassword) {
        incorrectRepeatedPassword.textContent = 'Пароли не совпадают.'
        NProgress.done()
        return
    } else incorrectRepeatedPassword.textContent = ''


    fetch(`/api/register/${username}/${email}/${password}`, {
        method: 'POST'
    }).then(x => x.json()).then(x => {
        if (!x.status) {
            incorrectEmail.textContent = 'Данная почта уже используется.'
            NProgress.done()
            return
        }

        localStorage.accountData = JSON.stringify({
            id: x.account.id,
            username,
            email,
            password,
            remember: true
        })

        loadButtons([
            {
                text: username + ' | Не подтверждён',
                icon: 'fas fa-user',
                style: 'cursor: default'
            }, {
                text: 'Светлая',
                href: '#',
                icon: 'fas fa-sun',
                id: 'themeButtonPC',
                mobileID: 'themeButtonMobile',
                onClick: 'changeTheme()',
            }, {
                text: 'Настройки аккаунта',
                icon: 'fas fa-shield-alt',
                onClick: 'window.location = \'/account\''
            }, {
                text: 'Выход',
                icon: 'fas fa-door-open',
                onClick: 'logout()'
            }
        ])

        successfulyCreated.innerHTML = `Аккаунт создан. Письмо с активацией аккаунта было отправлено на почту <b>"${email}"</b>.<br>Если письмо не пришло, проверьте папку "Спам".`
        NProgress.done()
    }).catch(err => {
        console.warn(`Failed to send the registration data to API: ${err}`)
        document.getElementById('incorrectRepeatedPassword').textContent = 'Сервер авторизации недоступен.'
    })
}

document.onkeydown = function (x) {
    if (x.key == 'Enter') return checkRegisterData()
}