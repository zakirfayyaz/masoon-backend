const crypto = require('crypto');
algorithm = "aes-128-cbc",
    secret = 'MySecretKeyForEn',
    keystring = Buffer.from("MySecretKeyForEn"),
    iv = Buffer.from("MySecretKeyForEn"),
    inputEncoding = 'utf8',
    outputEncoding = 'base64';
function encrypt(text) {
    let cipher = crypto.createCipheriv(algorithm, keystring, iv);
    let encrypted = cipher.update(text, inputEncoding, outputEncoding)
    encrypted += cipher.final(outputEncoding);
    return encrypted;
}

module.exports = encrypt