//assist function for tasks
const crypto = require('crypto');
const config = require('./config')


const helpers = {};
helpers.hash = (str) => {
    //statement problem
    if (typeof str == 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash
    } else { return false }
};

helpers.parsedJsonToObject = (str) => {
    try {
        const obj = JSON.parse(str);
        return obj;
    } catch {
        return {};
    }
};

helpers.createRandomString = (stringLength) => {
    stringLength = typeof stringLength == 'number' && stringLength > 0 ? stringLength : false;
    if (stringLength) {
        //define possible characters
        const possibleCharacters = 'yz1hi45fgqrcd3kelmn8stjuvwx72op6ab9';
        let str = '';
        for (i = 1; i <= stringLength; i++) {
            //pick a character from random string.
            const randomCharacters = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length))
            // append
            str += randomCharacters;
        }
        return str;
    } else {
        return false
    }
}



module.exports = helpers





