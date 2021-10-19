function checkLoginData() {
    const email = document.getElementById('login').value
    const password = document.getElementById('password').value
    const rememberMe = document.getElementById('rememberMe').checked

    NProgress.start()

    if (!email) {
        document.getElementById('incorrectEmail').textContent = 'Укажите почту.'
        NProgress.done()
        return
    } else document.getElementById('incorrectEmail').textContent = ''

    if (!isEmail(email)) {
        document.getElementById('incorrectEmail').textContent = 'Укажите действительную почту.'
        NProgress.done()
        return
    } else document.getElementById('incorrectEmail').textContent = ''

    if (!password) {
        document.getElementById('incorrectPassword').textContent = 'Укажите пароль.'
        NProgress.done()
        return
    } else document.getElementById('incorrectPassword').textContent = ''

    if (password.length < 3) {
        document.getElementById('incorrectPassword').textContent = 'Длина пароля должна быть больше 3 символов.'
        NProgress.done()
        return
    } else document.getElementById('incorrectPassword').textContent = ''

    if (password.length > 15) {
        document.getElementById('incorrectPassword').textContent = 'Длина пароля должна быть меньше 15 символов.'
        NProgress.done()
        return
    } else document.getElementById('incorrectPassword').textContent = ''

    fetch(`/api/login/${email}/${password}/${rememberMe}`, {
        method: 'POST'
    }).then(x => x.json()).then(x => {
        if (!x.status) {
            document.getElementById('incorrectPassword').textContent = 'Неправильный логин или пароль.'
            NProgress.done()
            return
        }

        localStorage.accountData = JSON.stringify({
            id: x.account.id,
            username: x.account.username,
            email,
            password,
            remember: rememberMe
        })

        window.location = '/admin/logs'
    }).catch(err => {
        console.warn(`Failed to send the login data to API: ${err}`)
        document.getElementById('incorrectPassword').textContent = 'Сервер авторизации недоступен.'
    })
}