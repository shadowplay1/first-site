function isEmail(email = '') {
    const domains = [
        'ru', 'com', 'net', 'app', 'xyz',
        'ua', 'org', 'su', 'tk', 'me',
        'in', 'ro', 'io', 'de', 'lk',
        'ws', 'pl', 'pa', 'рф', 'fun', 'it',
        'es', 'online', 'info', 'fr', 'nr'
    ]

    const splittedEmail = email.split('.')

    if (!email) return false

    if (!email.includes('@')) return false
    if (splittedEmail.length < 2) return false

    if (email.includes('/')) return false
    if (email.includes('\\')) return false

    if (email.includes('&')) return false
    if (email.includes('?')) return false

    // if email includes space
    if (email.includes(' ')) return false

    // if email includes a special space (alt + 255 on num pad)
    if (email.includes(' ')) return false
    
    if (!domains.includes(splittedEmail[splittedEmail.length - 1])) return false
    return true
}