var express = require('express');
var ejs = require('ejs');
var app = express();

app.configure(function() {
  app.use(express.bodyParser());
  app.set('dirname', __dirname);
  app.use(app.router);
  app.use(express["static"](__dirname + "/public/"));
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
  return app.set('views', __dirname + "/views/");
});

app.get("/", function(req, res) {
  return res.render('index.ejs');
});

var port = process.env.PORT || 7001;
app.listen(port);
console.log("Listening on Port '" + port + "'");
