/**
 * Copyright 2016 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the “License”);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an “AS IS” BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 // First add the obligatory web framework
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
  extended: false
}));

// Util is handy to have around, so thats why that's here.
const util = require('util')
// and so is assert
const assert = require('assert');

// Then we'll pull in the database client library
var elasticsearch=require('elasticsearch');

// Now lets get cfenv and ask it to parse the environment variable
var cfenv = require('cfenv');

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// We want to extract the port to publish our app on
var port = appEnv.PORT || 8080;

// get our app functions
var functions = require('./functions.js');

// use jade/pug as the view engine
app.set('view engine', 'pug');
app.set('views', __dirname + '/public/views/');

app.get('/', function(request, response) {
  functions.getConstituencies(function(constituencyList){
    if(constituencyList){
      response.render('index', {
          constituencies: constituencyList
      });
    }
  });
});

app.get('/search', function(request, response) {
  if (!request.query.postcode && !request.query.constituency) {
    response.send("<p>Please enter a postcode or parliamentary constituency</p>");
  }
  if (request.query.postcode){
    functions.getResults(request.query.postcode, function(htmlList) {
      response.send(htmlList);
    });
  }
  if (request.query.constituency) {
    functions.results(request.query.constituency,function(htmlList){
      response.send(htmlList);
    });
  }
});

// Now we go and listen for a connection.
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
