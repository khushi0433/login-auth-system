const bcrypt = require('bcryptjs');

exports.doHash = (value, saltvalue) => {
    const result = bcrypt.hash(value, saltvalue)
    return result
}

exports.doHashValidation = (value, hashedValue) => {
    const result = bcrypt.compare(value, hashedValue)
    return result
}
