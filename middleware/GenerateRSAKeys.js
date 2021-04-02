const crypto = require('crypto');
algorithm = "aes-128-cbc",
    secret = 'MySecretKeyForEn',
    keystring = Buffer.from("MySecretKeyForEn"),
    iv = Buffer.from("MySecretKeyForEn"),
    inputEncoding = 'utf8',
    outputEncoding = 'base64';

function decrypt(encrypted) {
    let decipher = crypto.createDecipheriv(algorithm, keystring, iv)
    let dec = decipher.update(encrypted, outputEncoding, inputEncoding)
    dec += decipher.final(inputEncoding);
    return dec;
}

module.exports = decrypt