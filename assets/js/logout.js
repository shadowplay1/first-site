function logout() {

    /**
     * @type {AccountData}
     */
    const accountData = JSON.parse(localStorage.accountData)

    fetch(`/api/logout/${accountData.email}/${accountData.username}/${accountData.password}`, {
        method: 'POST'
    }).then(x => x.json()).then(x => {
        if (!x.status) {
            console.warn('[Auth] Bad activity detected.')
            return
        }

        window.location = '/'
    })
}