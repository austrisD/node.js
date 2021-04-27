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



module.exports = helpers





