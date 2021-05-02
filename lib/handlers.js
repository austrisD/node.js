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
              callback(500, { 'Error': 'Could not create the users,It may already exist' })
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

handlers._users.get = (data, callback) => {
  //check if phone number is valid
  const phoneNumber = typeof (data.queryStringObject.phoneNumber) == "string" && data.queryStringObject.phoneNumber.trim().length == 10 ? data.queryStringObject.phoneNumber.trim() : false;
  if (phoneNumber) {
    // lookup for user
    _data.read('users', phoneNumber, (err, data) => {
      if (!err && data) {
        //remove hashed password before show up
        delete data.hashedPassword
        callback(200, data)
      } else { callback(404); }
    })

  } else { callback(400, { "Error": "Missing Required field" }) }

};

handlers._users.put = (data, callback) => {
  const phone = typeof (data.payload.phoneNumber) == "string" && data.payload.phoneNumber.trim().length == 10
    ? data.payload.phoneNumber.trim()
    : false;
  const firstName =
    typeof data.payload.firstName == "string" && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim()
      : false;
  const lastName =
    typeof data.payload.lastName == "string" && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim()
      : false;
  const password =
    typeof data.payload.password == "string" && data.payload.password.trim().length > 0 ? data.payload.password.trim()
      : false;
  // Error if phone number is invalid
  if (phone) {
    // error if nothing is sed to update
    if (firstName || lastName || password) {
      _data.read("users", phone, (err, userData) => {
        if (!err && userData) {
          //update fields
          if (firstName) { userData.firstName = firstName; }
          if (lastName) { userData.lastName = lastName; }
          if (password) { userData.hashedPassword = helpers.hash(password); }
          //Store new user updates
          _data.update("users", phone, userData, (err) => {
            if (!err && userData) {
              callback(200)
            } else {
              callback(500, { 'Error': 'Could not update the user' })
            }
          })

        } else {
          callback(400, { 'Error': 'Specified user does not exist' })
        }
      })
    } else {
      callback(400, { 'Error': 'Missing field to update' })
    }
  } else {
    callback(400, { "Error": "Missing required field" });
  }
};


handlers._users.delete = (data, callback) => {
  const phoneNumber = typeof (data.payload.phoneNumber) == "string" ? data.payload.phoneNumber.trim() : false;
  if (phoneNumber) {
    // lookup for user
    _data.read('users', phoneNumber, (err, data) => {
      if (!err && data) {
        _data.delete('users', phoneNumber, (err) => {
          if (!err) {
            callback(200)
          } else {
            callback(500, { "Error": "Could not delete users" })
          }
        })
      } else { callback(400, { "Error": "Could not find the specified user" }) }
    })
  } else {
    callback(400, { "Error": "Missing Required field" })
    console.log(phoneNumber);
  }
};
//not fond handler
handlers.notFound = (data, callback) => {
  callback(404);
};

module.exports = handlers;
