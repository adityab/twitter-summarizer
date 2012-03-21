var summarizer = require('./lib/handler.js');

summarizer.summarize("patel", function(summary) {
    console.log(summary);
});
