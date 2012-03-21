var summarizer = require('./lib/handler.js');

summarizer.summarize("KONY", function(summary) {
    console.log(summary);
});
