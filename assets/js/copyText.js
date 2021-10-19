function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea')
    textArea.value = text

    textArea.style.top = '0'
    textArea.style.left = '0'
    textArea.style.position = 'fixed'

    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
        document.execCommand('copy')
    } catch (err) {
        console.warn(`Failed to copy the text: ${err}`)
    }

    document.body.removeChild(textArea)
}

function copyText(text) {
    if (!navigator.clipboard) return new Promise((resolve, reject) => {
        try {
            if (!text) throw new TypeError('There\'s nothing to copy to the clipboard.')

            fallbackCopyTextToClipboard(text)
            resolve(true)
        } catch (err) {
            console.warn(`Failed to copy the text: ${err}`)
            reject(err)
        }
    })

    return navigator.clipboard.writeText(text)
}