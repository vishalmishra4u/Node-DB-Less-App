/*
* Primary file for the API
*/

//Dependencies
var server = require('./lib/server');
var workers = require('./lib/workers');

//Declare the app
var app = {};

//Initialization function
app.init = function(){
  //Start the server
  server.init();
  //start the workers
  workers.init();
};

//Execute the function
app.init();

//Export the app
module.exports = app;
