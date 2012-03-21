var http = require('http');
var POS = require('pos');
var fs = require('fs');
var sys = require('util');
var exec = require('child_process').exec;

var lexer = new POS.Lexer();
var tagger = new POS.Tagger();

var getTweets = function(queryString, callback) {
    var tweets = "";

    var request = http.request({
        host: "search.twitter.com",
        port: 80,
        method: "GET",
        path: "/search.json?result_type=mixed&lang=en&rpp=100&q=" + escape(queryString)
    })
    .on("response", function(response) {
        response.on("data", function(data) {
            tweets += data;
        });
        response.on("end", function() {
            var texts = JSON.parse(tweets).results.map(function(tweet) {
                return tweet.text;
            });
            return callback(texts);
        });
    }).end();
}

var tagWithPOS = function(tweets, callback) {
    return callback(tweets.map(function(text) {
        var result = "";

        var tagged = tagger.tag(lexer.lex(text));
        for(i in tagged) {
            var pair = tagged[i];
            result += pair[0] + "/" + pair[1] + " ";
        }
        return result;
    }));
}

var getSummary = function(tagged, callback) {
    var current = Date.now();
    fs.mkdir(current + '', function() {
        fs.mkdir(current + '/input');
        fs.mkdir(current + '/output');
    });

    var properties = "redundancy=2\ngap=2\nmax_summary=5\nscoring_function=2\ncollapse=false\nrun_id=1";
    var input = "";
    
    for(i in tagged) {
        input += ( tagged[i] + "\n" );
    }
    
    fs.mkdir(current + '/etc', function() {
        fs.writeFile(current + '/etc/opinosis.properties', properties, function(err) {
        if(err) throw err;
        else {
            fs.writeFile(current + '/input/data.parsed', input, function(err) {
                if(err) throw err;
                else {
                    // now run it!
                    var child = exec('java -jar lib/opinosis.jar -b ' + current, function(error) {
                        fs.readFile(current + '/output/1/data.1.system', 'utf8', function(err, data) {
                            if(err) throw err;
                            else {
                                callback(data);
                            }
                        });
                    });
                }
            });
        }
        });
    });
}

module.exports.summarize = function(query, callback) {
    getTweets(query, function(tweets) {
        console.log(tweets);
        tagWithPOS(tweets, function(tagged) {
            getSummary(tagged, function(summary) {
                return callback(summary);
            });
        });
    });
}
