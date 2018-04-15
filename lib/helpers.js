/*
* Helpers for various tassks
*/

var crypto = require('crypto');
var config = require('./config');
var https = require('https');
var querystring = require('querystring');

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
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
  if(strLength){
    //Define all the possible characters that could go into a string
    var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var str = "";
    for(i=1; i<=strLength; i++){
      //get a randome char from possibleCharacters string
      var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length))
      //Append this char to the final string
      str += randomCharacter;
    }
    return str;
  }else{
    return false;
  }
}

//Send a sms via Twilio
helpers.sendTwilioSms = function(phone,msg, callback){
  //Validate the params
  phone = typeof(phone) == "string" && phone.trim().length == 10 ? phone.trim() : false;
  msg = typeof(msg) == "string" && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;
  if(phone && msg){
    //Configure the request payload
    var payload = {
      'From' : config.twilio.fromPhone,
      'To' : '+91'+phone,
      'Body' : msg
    };
    //Stringify the payload
    var stringPayload = querystring.stringify(payload);

    //Configure the request details
    var requestDetails = {
      'protocol' : 'https',
      'hostname' : 'api.twilio.com',
      'method' : 'POST',
      'path' : '/2010-04-01/Accounts/'+config.twilio.accountSid+'/Messages.json',
      'auth' : config.twilio.accountSid+':'+config.twilio.authToken,
      'headers' : {
        'Content-Type' : 'application/x-www-form-urlencoded',,
        'Content-Length' : Buffer.byteLength(stringPayload)
      }
    };

    //Instantaite the request object
    var req = https.request(requestDetails function(res){
      //Grab the status of the sent status
      var status = res.statusCode;
    });

  }else {
    callback('Given params were missing or invalid');
  }

}

//Export helpers
module.exports = helpers;
