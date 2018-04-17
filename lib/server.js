/*
* Server related tasks
*/

//Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');
var handlers = require('./handlers');
var helpers = require('./helpers');
var path = require('path');

//Instantiate the server module object
var server = {};

//Instantiating the http port
server.httpServer = http.createServer(function(req, res){
  server.unifiedServer(req, res);
});

//Instantiating https server
server.httpsServerOptions = {
  'key' : fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
  'cert' : fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
};

server.httpsServer = https.createServer(server.httpsServerOptions, function(req, res){
  server.unifiedServer(req, res);
});

//All the server logic for both http and https server
server.unifiedServer = function(req, res){
  //Get the URL and parse it
  var parsedUrl = url.parse(req.url, true);

  //Get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g,'');

  //Get the query string as an object
  var queryStringObject = parsedUrl.query;

  //Get the HTTp method;
  var method = req.method.toLowerCase();

  //Get the headers of the request
  var headers = req.headers;

  //Get the payload if any
  var decoder = new StringDecoder('utf-8');
  var buffer = "";
  req.on('data', function(data){
    buffer += decoder.write(data);
  });

  req.on('end', function(){
    buffer += decoder.end();

    var chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

    var data = {
      'trimmedPath' : trimmedPath,
      'queryStringObject' : queryStringObject,
      'headers' : headers,
      'method' : method,
      'payload' : helpers.parseJsonToObject(buffer)
    };

    chosenHandler(data, function(statusCode, payload){
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      payload = typeof(payload) == 'object' ? payload : {};

      var payloadString = JSON.stringify(payload);
      res.setHeader('Content-Type','application-JSON');
      res.writeHead(statusCode);
      res.end(payloadString);

      //Log the request path
      console.log('Returning this response: ', statusCode, payloadString);
    });
  });
};

//Define a request router
server.router = {
  'users' : handlers.users,
  'tokens' : handlers.tokens,
  'checks' : handlers.checks
};

//init script
server.init = function(){
  //start the HTTP server
  server.httpServer.listen(config.httpPort, function(){
    console.log('The http server is listening on port '+config.httpPort+' now');
  });

  //start the HTTPS server
  server.httpsServer.listen(config.httpsPort, function(){
    console.log('The https server is listening on port '+config.httpsPort+' now');
  });
};

module.exports = server;
