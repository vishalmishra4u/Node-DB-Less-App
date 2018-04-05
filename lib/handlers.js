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
}

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
handlers.users.put = function(data, callback){

}

// Users - delete
handlers.users.delete = function(data, callback){

}

//Not found handler
handlers.notFound = function(data, callback){
  callback(404);
};

module.exports = handlers;
