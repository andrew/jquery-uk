var five = require("johnny-five"),
    arDrone = require('ar-drone'),
    client  = arDrone.createClient();

var express = require('express');
var ejs = require ('ejs')
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

var port = process.env.PORT || 8000;
app.listen(port);
console.log("Listening on Port '" + port + "'");

var io = require('socket.io').listen(8001);

five.Board().on("ready", function(){
  var leftFlexSensor = new five.Sensor("A0");
  var rightFlexSensor = new five.Sensor("A1");

  leftFlexSensor.on("read", function(err, value){
    var a= five.Fn.map(value, 150, 500, -90, 90)
    io.sockets.emit('left', { angle: a, value: value });
  });
  rightFlexSensor.on("read", function(err, value){
    var a = five.Fn.map(value, 500, 150, -90, 90)
    io.sockets.emit('right', { angle: a, value: value });
  });
});
