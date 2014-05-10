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

var leftVertical = 0;
var rightVertical = 0;

var upperLimit = 30;
var lowerLimit = -30;

function move() {
  var left = leftVertical
  var right = rightVertical*-1
  // up
  if(left > upperLimit && right > upperLimit){
    command = 'up'
  }
  // down
  else if(left < lowerLimit && right < lowerLimit){
    command = 'down'
  }
  // left
  else if(left < lowerLimit && right > upperLimit){
    command = 'left'
  }
  // right
  else if(left > upperLimit && right < lowerLimit){
    command = 'right'
  }
  // hover
  else {
    command = 'hover'
  }
  io.sockets.emit('command', {command: command, left: left, right: right});
}

five.Board().on("ready", function(){
  var leftFlexSensor = new five.Sensor("A0");
  var rightFlexSensor = new five.Sensor("A1");

  leftFlexSensor.on("read", function(err, value){
    var a= five.Fn.map(value, 100, 400, -90, 90)
    leftVertical = five.Fn.constrain(a, -80, 80)
    io.sockets.emit('left', { angle: leftVertical, value: value });
    move()
  });
  rightFlexSensor.on("read", function(err, value){
    var a = five.Fn.map(value, 500, 100, -90, 90)
    rightVertical = five.Fn.constrain(a, -80, 80)
    io.sockets.emit('right', { angle: rightVertical, value: value });
    move()
  });
});
