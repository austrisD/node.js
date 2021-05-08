const _data = require('./data')
const helpers = require('./helpers')
//define the handlers
const handlers = {};


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
    //get token from header
    const token = typeof (data.headers.token) == 'string' ? data.headers.token : false;
    //verify if token mach up
    handlers._tokens.verifyToken(token, phoneNumber, (tokenIsValid) => {
      if (tokenIsValid) {
        // lookup for user
        _data.read('users', phoneNumber, (err, data) => {
          if (!err && data) {
            //remove hashed password before show up
            delete data.hashedPassword
            callback(200, data)
          } else { callback(404); }
        })
      } else { callback(403, { 'Error': 'Missing required token from header,or token is invalid' }) }
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
      const token = typeof (data.headers.token) == 'string' ? date.headers.token : false;
      //verify if token mach up
      handlers._tokens.verifyToken(token, phoneNumber, (tokenIsValid) => {
        if (tokenIsValid) {
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
          callback(400, { "Error": "Missing required field" });
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
    const token = typeof (data.headers.token) == 'string' ? date.headers.token : false;
    //verify if token mach up
    handlers._tokens.verifyToken(token, phoneNumber, (tokenIsValid) => {
      if (tokenIsValid) {
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
        callback(403, { 'Error': 'Missing required token from header,or token is invalid' })
      }
    })

  } else {
    callback(400, { "Error": "Missing Required field" })
  }
};




//tokens handler
handlers.tokens = (date, callback) => {
  const acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.indexOf(date.method) > -1) {
    handlers._tokens[date.method](date, callback);
    // callback(200);
  } else {
    callback(405);
  }
};
//container for all token methods
handlers._tokens = {};
//tokens methods

handlers._tokens.post = (data, callback) => {
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
  if (phoneNumber && password) {
    //search if user exist
    _data.read('users', phoneNumber, (err, userData) => {
      if (!err) {
        //hash sended password -> check if password is correct
        const hashedPasswords = helpers.hash(password);
        if (hashedPasswords == userData.hashedPassword) {
          //if valid, created token expiration date 1h
          const tokenID = helpers.createRandomString(20);
          const tokenExpires = Date.now() + 1000 * 60 * 60;
          const tokenObject = {
            'phone': phoneNumber,
            'ID': tokenID,
            'Expires': tokenExpires
          }
          //store the token
          _data.create('tokens', tokenID, tokenObject, (err) => {
            if (!err) {
              callback(200, tokenObject)
            } else {
              callback(500, { 'Error': 'Could not create token' })
            }
          })

        } else {
          callback(400, { 'Error': "provided password is wrong" })
        }

      } else {
        callback(400, { 'Error': "Could not find the specified user" })
      }
    })

  } else {
    callback(400, { "Error": "Missing required field(s)" })
  }

};

handlers._tokens.get = (data, callback) => {
  //check if id is valid
  // bug id dos not check who requested token,check if phone mach with ip (Extra level defence)
  const ID = typeof (data.queryStringObject.ID) == "string" && data.queryStringObject.ID.trim().length == 20 ? data.queryStringObject.ID.trim() : false;

  if (ID) {
    // lookup for tokens
    _data.read('tokens', ID, (err, tokenData) => {
      if (!err && tokenData) {
        callback(200, tokenData)
      } else { callback(404); }
    })

  } else { callback(400, { "Error": "Missing Required field" }) }
};

//extent tokens expiration date.
handlers._tokens.put = (data, callback) => {
  const ID = typeof (data.payload.ID) == "string" && data.payload.ID.trim().length == 20 ? data.payload.ID.trim() : false;

  const extend = data.payload.extend === true ? true : false;
  if (ID && extend) {
    _data.read('tokens', ID, (err, tokenData) => {
      if (!err && tokenData) {
        if (tokenData.Expires > Date.now()) {
          //extend expiration
          tokenData.Expires = Date.now() + 1000 * 60 * 60;
          //store updated data
          _data.update('tokens', ID, tokenData, (err) => {
            if (!err) {
              callback(200)
            } else {
              callback(500, { 'Error': 'Could not update token expiration' })
            }

          })
        } else {
          callback(400, { 'Error': 'Token already expired' })
        }

      } else {
        callback(400, { 'Error': 'Specified token does not exist' })
      }
    })
  } else { callback(400, { "Error": "Missing Required field or fields is invalid" }) }

};

//log out
handlers._tokens.delete = (data, callback) => {
  const ID = typeof (data.queryStringObject.ID) == "string" ? data.queryStringObject.ID.trim() : false;
  if (ID) {
    // lookup for user
    _data.read('tokens', ID, (err, data) => {
      if (!err && data) {
        _data.delete('tokens', ID, (err) => {
          if (!err) {
            callback(200)
          } else {
            callback(500, { "Error": "Could not delete tokens" })
          }
        })
      } else { callback(400, { "Error": "Could not find the specified tokens" }) }
    })
  } else {
    callback(400, { "Error": "Missing Required field" })
  }
};

//Verify if token is valid for specific users
handlers._tokens.verifyToken = (ID, phone, callback) => {
  _data.read('tokens', ID, (err, tokenData) => {
    if (!err && tokenData) {
      //Check that token is valid
      if (tokenData.phone == phone && tokenData.Expires > Date.now()) {
        callback(true)
      } else {
        callback(false)
      }
    } else {
      callback(false)
    }
  })
}










//not fond handler
handlers.notFound = (data, callback) => {
  callback(404);
};
// ping
handlers.ping = (data, callback) => {
  callback(200);
};




module.exports = handlers;
