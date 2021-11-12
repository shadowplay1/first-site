function logout() {

    /**
     * @type {AccountData}
     */
    const accountData = JSON.parse(localStorage.accountData || {})

    fetch(`/api/logout/${accountData.email}/${accountData.username}/${accountData.password}`, {
        method: 'POST'
    }).then(x => x.json()).then(x => {
        if (!x.status) {
            return console.warn('That\'s not working like that.')
        }

        delete localStorage.accountData
        window.location = '/'
    })
}