/*
* Primary file for the API
*/

//Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./lib/config');
var fs = require('fs');
var handlers = require('./lib/handlers');
var helpers = require('./lib/helpers');

//Instantiating the http port
var httpServer = http.createServer(function(req, res){
  unifiedServer(req, res);
});

//Start the http server
httpServer.listen(config.httpPort, function(){
  console.log('The http server is listening on port '+config.httpPort+' now');
});

//Instantiating https server
var httpsServerOptions = {
  'key' : fs.readFileSync('./https/key.pem'),
  'cert' : fs.readFileSync('./https/cert.pem')
};

var httpsServer = https.createServer(httpsServerOptions, function(req, res){
  unifiedServer(req, res);
});

//Start the https server
httpsServer.listen(config.httpsPort, function(){
  console.log('The https server is listening on port '+config.httpsPort+' now');
});

//All the server logic for both http and https server
var unifiedServer = function(req, res){
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

    var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

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
var router = {
  'user' : handlers.users,
  'tokens' : handlers.tokens
};
