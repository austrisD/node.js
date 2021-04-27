const _data = require('./data')
const helpers = require('./helpers')
//define the handlers
const handlers = {};

handlers.ping = (data, callback) => {
  callback(200);
};
handlers.users = (date, callback) => {
  const acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.indexOf(date.method) > -1) {
    handlers._users[date.method](date, callback);
    // callback(200);
  } else {
    callback(405);
  }
};
handlers._users = {};

handlers._users.post = (data, callback) => {
  const firstName =
    typeof data.payload.firstName == "string" &&
      data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  const lastName =
    typeof data.payload.lastName == "string" &&
      data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
  const phoneNumber =
    typeof data.payload.phoneNumber == "string" &&
      data.payload.phoneNumber.trim().length == 10
      ? data.payload.phoneNumber.trim()
      : false;
  const password =
    typeof data.payload.password == "string" &&
      data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  const agreement =
    typeof data.payload.agreement == "boolean" &&
      data.payload.agreement == true
      ? true
      : false;
  if (firstName && lastName && phoneNumber && password && agreement) {
    //check if already user exist
    _data.read('user', phoneNumber, (err, data) => {
      if (err) {
        //hash the password
        const hashedPassword = helpers.hash(password)
        if (hashedPassword) {
          //create user Object
          const userObject = {
            "firstName": firstName,
            "lastName": lastName,
            "phoneNumber": phoneNumber,
            "hashedPassword": hashedPassword,
            "agreement": true
          };
          _data.create('users', phoneNumber, userObject, (err) => {
            if (!err) {
              callback(200)
            } else {
              console.log(err);
              callback(500, { 'Error': 'Could not create the users,' })
            }
          });
        } else {
          callback(500, { 'Error': "Could not hash a user/s password" })
        }

      } else { callback(400, { 'Error': 'User with that phone number already exist' }) }
    })
  } else {
    callback(400, { 'error': 'Missing required fields' });
  }
};

handlers._users.get = (data, callback) => { };
handlers._users.put = (data, callback) => { };
handlers._users.delete = (data, callback) => { };

//not fond handler
handlers.notFound = (data, callback) => {
  callback(404);
};

module.exports = handlers;
