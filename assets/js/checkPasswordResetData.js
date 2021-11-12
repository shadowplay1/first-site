function checkPasswordResetData() {
    const email = document.getElementById('email').value

    const incorrectEmail = document.getElementById('incorrectEmail')
    const sentSuccessfully = document.getElementById('sentSuccessfully')

    NProgress.start()

    sentSuccessfully.textContent = ''

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

    fetch(`/api/users/fetch?email=${email}`).then(x => x.json()).then(x => {
        if (x.code == 404) {
            incorrectEmail.textContent = 'Данная почта не зарегестрирована.'
            NProgress.done()
            return
        } else incorrectEmail.textContent = ''


        fetch(`/api/password-reset/${email}`, {
            method: 'POST'
        }).then(x => x.json()).then(x => {
            if (x.code == 200) {
                sentSuccessfully.innerHTML = `Письмо со сбросом пароля было отправлено на почту "${email}"<br>Если письмо не пришло, проверьте папку "Спам".`
                NProgress.done()
                return
            } 

            if (x.code == 400) {
                incorrectEmail.innerText = 'Письмо со сбросом пароля уже было отправлено на указанную почту.'
                NProgress.done()
                return

            } else {
                incorrectEmail.textContent = 'Не удалось отправить письмо со сбросом пароля.'
                NProgress.done()
                return
            }
        }).catch(err => {
            console.warn(`Failed to send a password reset email: ${err}`)
            incorrectEmail.innerText = 'Не удалось отправить письмо со сбросом пароля.'

            NProgress.done()
        })

    }).catch(err => {
        console.warn(`Failed to check the account email: ${err}`)
        incorrectEmail.innerText = 'Не удалось проверить адрес почты.'

        NProgress.done()
    })
}

document.onkeydown = function (x) {
    if (x.key == 'Enter') return checkPasswordResetData()
}