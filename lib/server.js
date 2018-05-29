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

      // Determine the type of response (fallback to JSON)
         contentType = typeof(contentType) == 'string' ? contentType : 'json';

         // Use the status code returned from the handler, or set the default status code to 200
         statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

         // Return the response parts that are content-type specific
         var payloadString = '';
         if(contentType == 'json'){
           res.setHeader('Content-Type', 'application/json');
           payload = typeof(payload) == 'object'? payload : {};
           payloadString = JSON.stringify(payload);
         }

         if(contentType == 'html'){
           res.setHeader('Content-Type', 'text/html');
           payloadString = typeof(payload) == 'string'? payload : '';
         }


         // Return the response-parts common to all content-types
         res.writeHead(statusCode);
         res.end(payloadString);

         // If the response is 200, print green, otherwise print red
         if(statusCode == 200){
           debug('\x1b[32m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
         } else {
           debug('\x1b[31m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
         }
    });
  });
};

//Define a request router
server.router = {
  '' : handlers.index,
  'account/create' : handlers.accountCreate,
  'account/edit' : handlers.accountEdit,
  'account/deleted':handlers.accountDeleted,
  'session/create':handlers.sessionCreate,
  'session/deleted' : handlers.sessionDeleted,
  'checks/all' : handlers.checksList,
  'checks/create' : handlers.checksCreate,
  'checks/edit' : handlers.checksEdit,
  'api/users' : handlers.users,
  'api/tokens' : handlers.tokens,
  'api/checks' : handlers.checks
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
