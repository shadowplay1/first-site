async function createSharingLink(service, ...params) {
    try {
        const data = await fetch(`/api/solutions/${service}/create/${params.join('/')}`).then(x => x.json())
        if (!data.sharingLink) throw new TypeError('Failed to get a responce from the API.')

        return data.sharingLink
    } catch (err) {
        console.warn(`Failed to create a sharing link for "${service}": ${err}`)
    }
}