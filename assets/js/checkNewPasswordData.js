function checkNewPasswordData() {
    const newPassword = document.getElementById('newPassword').value
    const repeatedPassword = document.getElementById('repeatedPassword').value

    const incorrectNewPassword = document.getElementById('incorrectNewPassword')
    const incorrectRepeatedPassword = document.getElementById('incorrectRepeatedPassword')

    const changedSuccessfully = document.getElementById('changedSuccessfully')

    NProgress.start()
    changedSuccessfully.textContent = ''

    if (!newPassword) {
        incorrectNewPassword.textContent = 'Укажите новый пароль.'
        NProgress.done()
        return
    } else incorrectNewPassword.textContent = ''

    if (newPassword.length < 3) {
        incorrectNewPassword.textContent = 'Длина пароля должна быть больше 3 символов.'
        NProgress.done()
        return
    } else incorrectNewPassword.textContent = ''

    if (newPassword.length > 32) {
        incorrectNewPassword.textContent = 'Длина пароля должна быть меньше 32 символов.'
        NProgress.done()
        return
    } else incorrectNewPassword.textContent = ''


    if (!repeatedPassword) {
        incorrectRepeatedPassword.textContent = 'Повторите пароль.'
        NProgress.done()
        return
    } else incorrectRepeatedPassword.textContent = ''

    if (newPassword !== repeatedPassword) {
        incorrectRepeatedPassword.textContent = 'Пароли не совпадают.'
        NProgress.done()
        return
    } else incorrectRepeatedPassword.textContent = ''


    fetch(`/api/resetPassword/${location.search.slice('?token='.length)}/${newPassword}`, {
        method: 'POST'
    }).then(x => x.json()).then(x => {

        if (x.code == 404) {
            incorrectRepeatedPassword.textContent = 'Недействительный токен сброса пароля.'
            NProgress.done()
            return
        } else incorrectRepeatedPassword.textContent = ''

        changedSuccessfully.innerHTML = 'Пароль был успешно изменён!<br>Теперь вы можете закрыть эту страницу,<br>войти в свой аккаунт и продолжить работу с сайтом.'
        NProgress.done()

    }).catch(err => {
        console.warn(`Failed to reset password: ${err}`)
    })
}

document.onkeydown = function (x) {
    if (x.key == 'Enter') return checkNewPasswordData()
}