/*
* Helpers for various tassks
*/

var crypto = require('crypto');
var config = require('./config');

// COntainer for helpers
var helpers = {};

//Create a SHA256
helpers.hash = function(str){
  if(typeof(str) == 'string' && str.length > 0){
    var hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');
    return hash;
  }
  else{
    return false;
  }
}

//parse a json string to an object in all cases
helpers.parseJsonToObject = function(str){
  try{
    var obj = JSON.parse(str);
    return obj;
  }catch(e){
    return {};
  }
}

//Create a string of random alphanumeric characters of given length
helpers.createRandomString = function(strLength){
  strlength = typeof(strLength) == 'number' && strLength > 0 ? strlength : false;
  if(strLength){
    //Define all the possible characters that could go into a string
    var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for(i=1; i<strLength; i++){
      //get a randome char from possibleCharacters string
      var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length))
      //Append this char to the final string
      str += randomCharacter;
    }
  }else{
    return false;
  }
}

//Export helpers
module.exports = helpers;
