function checkLoginData() {
    const email = document.getElementById('login').value
    const password = document.getElementById('password').value
    const rememberMe = document.getElementById('rememberMe')?.checked || true

    const incorrectEmail = document.getElementById('incorrectEmail')
    const incorrectPassword = document.getElementById('incorrectPassword')

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

    if (password.length > 15) {
        incorrectPassword.textContent = 'Длина пароля должна быть меньше 15 символов.'
        NProgress.done()
        return
    } else incorrectPassword.textContent = ''

    fetch(`/api/login/${email}/${password}/${rememberMe}`, {
        method: 'POST'
    }).then(x => x.json()).then(x => {
        if (!x.status) {
            incorrectPassword.textContent = 'Неправильный логин или пароль.'
            NProgress.done()
            return
        }

        document.cookie = `email=${email}; path=/`

        localStorage.accountData = JSON.stringify({
            id: x.account.id,
            username: x.account.username,
            email,
            password,
            remember: rememberMe
        })

        window.location = x.account.admin ? '/admin/logs' : '/'
    }).catch(err => {
        console.warn(`Failed to send the login data to API: ${err}`)
        incorrectPassword.textContent = 'Сервер авторизации недоступен.'
    })
}

document.onkeydown = function (x) {
    if (x.key == 'Enter') return checkLoginData()
}