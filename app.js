var express = require('express');
var request = require('request');

var app = express();

var port = process.env.PORT || 8000;

var cache = {};

app.get('/drone-data', function(req, res) {

  if(cache.data && (cache.timestamp + (24 * 60 * 60 * 1000)) > new Date().getTime()) {
    return res.status(200).send(cache.data);
  }

  request("http://api.dronestre.am/data", function(err, response, body) {

    cache.timestamp = new Date().getTime();
    cache.data = body;

    res.status(200).send(body);
  });
});

app.use(express.static('public'));

app.listen(port, function() {
  console.log("Hawey pet!");
});