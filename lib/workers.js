/*
*worker related tasks
*/

//dependecies
var path = require('path');
var fs = require('fs');
var _data = require('./data');
var https = require('https');
var http = require('http');
var helpers = require('./helpers');
var url = require('url');

//Instantiate the worker object
var workers = {};

//Lookup all checks, get their data and send to a validator
workers.gatherAllChecks = function(){
  //get all checks that exist
  _data.list('checks', function(err, checks){
    if(!err && checks && checks.length > 0){
      checks.forEach(function(check){
        //Read in check data
        _data.read('checks', check, function(err, originalCheckData){
          if(!err && originalCheckData){
            //pass the check to the validator and let that function continue or log errors
            workers.validateCheckData(originalCheckData);
          }else{
            console.log('Error reading one of check data');
          }
        });
      });
    }else{
      console.log('Could not find any checks');
    }
  });
};

//sanity checking the check data
workers.validateCheckData = function(originalCheckData){
  originalCheckData = typeof(originalCheckData) == 'object' && originalCheckData !== null ? originalCheckData : {};
  originalCheckData.id = typeof(originalCheckData.id) == 'string' && originalCheckData.id.trim().length == 20 ? originalCheckData.id.trim() : false;
  originalCheckData.userPhone = typeof(originalCheckData.userPhone) == 'string' && originalCheckData.userPhone.trim().length == 10 ? originalCheckData.userPhone.trim() : false;
  originalCheckData.protocol = typeof(originalCheckData.protocol) == 'string' && ['http','https'].indexOf(originalCheckData.protocol) > -1 ? originalCheckData.protocol : false;
  originalCheckData.url = typeof(originalCheckData.url) == 'string' && originalCheckData.url.trim().length > 0 ? originalCheckData.url.trim() : false;
  originalCheckData.method = typeof(originalCheckData.method) == 'string' &&  ['post','get','put','delete'].indexOf(originalCheckData.method) > -1 ? originalCheckData.method : false;
  originalCheckData.successCodes = typeof(originalCheckData.successCodes) == 'object' && originalCheckData.successCodes instanceof Array && originalCheckData.successCodes.length > 0 ? originalCheckData.successCodes : false;
  originalCheckData.timeoutSeconds = typeof(originalCheckData.timeoutSeconds) == 'number' && originalCheckData.timeoutSeconds % 1 === 0 && originalCheckData.timeoutSeconds >= 1 && originalCheckData.timeoutSeconds <= 5 ? originalCheckData.timeoutSeconds : false;

  //Set the keys that may not be set(if the workers have never seen this check before)
  

};

//Timer to execute the worker process and execute them
workers.loop = function(){
  setInterval(function(){
    workers.gatherAllChecks();
  },1000*60);
}

//Init script
workers.init = function(){
  //Execute all the checks
  workers.gatherAllChecks();

  //call the loop so the checks will execute later on
  workers.loop();
};

//Export the module
module.exports = workers;
