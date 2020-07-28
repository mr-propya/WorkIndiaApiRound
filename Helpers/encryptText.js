const crypt = require("crypto");
const dotenv = require("dotenv")

dotenv.config()

let hashPassword = (text,key,saltSize)=>{
    const salt = crypt.randomBytes(saltSize).toString("hex")
    console.log(salt+text)
    const hash = crypt.pbkdf2Sync(key,salt+text,10,64,"sha256").toString("hex")

    return {
        "salt":salt,
        "hash":hash
    }

}

let checkHash = (text,key,salt,hashAvail)=>{
    const hash = crypt.pbkdf2Sync(key,salt+text,10,64,"sha256").toString("hex")
    // console.log(hashAvail)
    // console.log(hash)
    return hash===hashAvail;
}

let cipherText = (text,key)=>{
    const salt = crypt.randomBytes(16)

    // salt is iv
    const keyBuffer = Buffer.from(key,"hex")

    let cipheriv = crypt.createCipheriv("aes-256-cbc",keyBuffer,Buffer.from(salt));
    let cipherText = cipheriv.update(text)
    cipherText = Buffer.concat([cipherText,cipheriv.final()])

    return {
        "iv":salt.toString("hex"),
        "data":cipherText.toString("base64")
    }
}

let diCipherText = (text,key,iv)=>{
    const keyBuffer = Buffer.from(key,"hex")
    let encryptedText = Buffer.from(text, 'base64');
    let decipher = crypt.createDecipheriv('aes-256-cbc', keyBuffer, Buffer.from(iv,"hex"));
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

if(!module.parent){
    const key = "67a491e598902b19e7afb75ee76bbb048529f3eb43031cce9abd58ff6a5bcc62"
    console.log(key)
    c = cipherText("abc",key)
    console.log(c)
    console.log(diCipherText(c.data,key,c.iv))

}


module.exports = {
    "hashPassword":hashPassword,
    "verifyHash":checkHash,
    "encryptText":cipherText,
    "decryptText":diCipherText
}