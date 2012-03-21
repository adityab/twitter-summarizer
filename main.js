var sys = require('sys');
var querystring = require('querystring');
var fs = require('fs');
var express = require('express');
var summarizer = require('./lib/handler.js');

var app = express.createServer();

app.use(express.bodyParser());
app.use(app.router);

app.get('/', function(req, res) {
    fs.readFile('index.html', function(err, page) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(page);
        res.end();
    });
});

app.post('/', function(req, res) {
    summarizer.summarize(req.body.query, function(summary) {
        res.end(summary);
    });
});

app.listen(8080);
