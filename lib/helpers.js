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
helpers.parseJsonTOObject = function(str){
  try{
    var obj = JSON.parse(str);
    return obj;
  }catch(e){
    return {};
  }
}

//Export helpers
module.exports = helpers;
