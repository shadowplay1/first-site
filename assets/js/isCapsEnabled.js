function isCapsEnabled(e) {
    let capsLock
    
    const charCode = e.charCode;
    const shiftKey = e.shiftKey;

    if (charCode >= 97 && charCode <= 122) {
        capsLock = shiftKey;
    } else if (charCode >= 65 && charCode <= 90
        && !(shiftKey && navigator.platform == 'Mac')) {
        capsLock = !shiftKey;
    }

    return capsLock;
}