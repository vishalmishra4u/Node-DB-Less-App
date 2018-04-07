/*
*Request Handlers
*/

//Dependencies
var _data = require('./data');
var helpers = require('./helpers');

//Define the handlers
var handlers = {};

handlers.users = function(data, callback){
  var acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers.users[data.method](data, callback);
  }else{
    callback(405);
  }
}

// Users - post
//Required data : firstName, lastName, phone, password, tosAgreement
handlers.users.post = function(data, callback){
  //Check all fields are filled out
  var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

  if(firstName && lastName && phone && password && tosAgreement){
    //Make sure users dsnt already exist- unique phone
    _data.read('users', phone, function(err, data){
      if(err){
        //hash the password
        var hashedPassword = helpers.hash(password);
        if(hashedPassword){

            //Create a user object
            var userObject = {
            'firstName' : firstName,
            'lastName' : lastName,
            'phone' : phone,
            'hashedPassword' : hashedPassword,
            'tosAgreement' :  true
          };

          //Store the user
          _data.create('users', phone, userObject, function(err){
              if(!err){
                callback(200);
              }else{
                console.log(err);
                callback(500,{'Error':'Could not create the new user'});
              }
            });
        }else{
          callback(500,{'Error':'Could not hash the user\'s password'});
        }

      }else{
        //users alrweady exist
        callback(400, {'Error':'User already exist'});
      }
    });
  }else{
    callback(400, {'Error':'Missing Required fields'});
  }
};

// Users - get
// Required - phone
// Optional - None
// @TODO: Only let authenticated users access data
handlers.users.get = function(data, callback){
  var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  if(phone){
    _data.read('users',phone,function(err, data){
      if(!err && data){
        //delete the hashed pwd from response
        delete data.hashedPassword;
        callback(200, data);
      }else{
        callback(404,{'Error':'User missing'});
      }
    });
  }else{
    callback(400,{'Error':'Missing required fields'});
  }
}

// Users - put
// Required - phone
// Optional - Everyting else(atleast one must be specified)
// @TODO : Only let authenticated users update
handlers.users.put = function(data, callback){
  //Check for the Required fields
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

  //Check for the optional fields
  var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  //Error if the phone is invalid
  if(phone){
    if(firstName || lastName || password){
      //Lookup the user
      _data.read('users',phone,function(err, userData){
        if(!err){
          if(firstName){
            userData.firstName = firstName;
          }
          if(lastName){
            userData.lastName = lastName;
          }
          if(password){
            userData.hashedPassword = helpers.hash(password);
          }
          //Store new updates
          _data.update('users',phone, userData, function(err){
            if(!err){
              callback(200);
            }else{
              console.log('Could not update');
              callback(500, {'Error' : 'Unabale to update user details'});
            }
          });
        }else{
          callback(400, {'Error':"The specified user does not exist"});
        }
      });
    }else{
      callback(400, {'Error': 'Missing fields to update'});
    }
  }else{
    callback(400, {'Error' : 'Phone Required to update data'});
  }
};

// Required data: phone
// @TODO Only let an authenticated user delete their object. Dont let them delete update elses.
// @TODO Cleanup (delete) any other data files associated with the user
handlers.users.delete = function(data,callback){
  // Check that phone number is valid
  var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  if(phone){
    // Lookup the user
    _data.read('users',phone,function(err,data){
      if(!err && data){
        _data.delete('users',phone,function(err){
          if(!err){
            callback(200);
          } else {
            callback(500,{'Error' : 'Could not delete the specified user'});
          }
        });
      } else {
        callback(400,{'Error' : 'Could not find the specified user.'});
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required field'})
  }
};

handlers.tokens = function(data, callback){
  var acceptableMethods = ['post','get','put','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    handlers.tokens[data.method](data, callback);
  }else{
    callback(405);
  }
}

//Container for all the token methods
handlers.tokens = {};

//tokens - post
handlers.tokens.post = function(data, callback){
  //Check all fields are filled out
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  if(phone && password){
    //Lookup the user who matches that phone number
    _data.read('users', phone, function(err, userData){
      if(!err && userData){
        //hash the password and compare with the saved pwd
        var hashedPassword = helpers.hash(password);
        if(hashedPassword == userData.hashedPassword){

          //If valid, create a new token with a randomname. Set exiration date 1 hr in future
          var tokenId = heleprs.createRandomString(20);
          var expires = Date.now() + 1000 * 60 * 60;
          var tokenObject = {
            'phone' : phone,
            'id' : tokenId,
            'expires' : expires
          };

          _data.create('tokens',tokenId, tokenObject, function(err){
            if(!err){
              callback(200, tokenObject);
            }
            else{
              callback(500, {'Error': 'Could not create new token'});
            }
          });
        }else{
          callback(400,{'Error':'Passwords do not match'});
        }
      }else{
        //users alrweady exist
        callback(400, {'Error':'Could not find apecified user'});
      }
    });
  }else{
    callback(400, {'Error':'Missing Required fields'});
  }
};

//tokens - get
handlers.tokens.post = function(data, callback){

}

//tokens - get
handlers.tokens.get = function(data, callback){

}

//tokens - delete
handlers.tokens.put = function(data, callback){

}

//Not found handler
handlers.notFound = function(data, callback){
  callback(404);
};

module.exports = handlers;
