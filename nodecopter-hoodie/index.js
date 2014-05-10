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

var leftY = rightY = leftZ = rightZ = 0;

var upperLimit = 30;
var lowerLimit = -30;

function move() {
  var left = leftY
  var right = rightY*-1

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
  moveZ()
}

var upperLimitZ = 35;
var lowerLimitZ = -15;

function moveZ(){
  var left = leftZ
  var right = rightZ

  // up
  if(left > upperLimitZ && right > upperLimitZ){
    command = 'forward'
  }
  // down
  else if(left < lowerLimitZ && right < lowerLimitZ){
    command = 'back'
  }
  // left
  else if(left < lowerLimitZ && right > upperLimitZ){
    command = 'clockwise'
  }
  // right
  else if(left > upperLimitZ && right < lowerLimitZ){
    command = 'counterClockwise'
  }
  // hover
  else {
    command = 'hover'
  }
  io.sockets.emit('commandZ', {command: command, left: left, right: right});
}

five.Board().on("ready", function(){
  var leftYFlexSensor = new five.Sensor("A0");
  var rightYFlexSensor = new five.Sensor("A1");
  var leftZFlexSensor = new five.Sensor("A2");
  var rightZFlexSensor = new five.Sensor("A3");

  leftYFlexSensor.on("read", function(err, value){
    var a= five.Fn.map(value, 100, 500, -90, 90)
    leftY = five.Fn.constrain(a, -80, 80)
    io.sockets.emit('leftY', { angle: leftY, value: value });
    move()
  });
  rightYFlexSensor.on("read", function(err, value){
    var a = five.Fn.map(value, 400, 100, -90, 90)
    rightY = five.Fn.constrain(a, -80, 80)
    io.sockets.emit('rightY', { angle: rightY, value: value });
    move()
  });

  leftZFlexSensor.on("read", function(err, value){
    var a= five.Fn.map(value, 550, 330, -60, 60)
    leftZ = five.Fn.constrain(a, -60, 60)
    io.sockets.emit('leftZ', { angle: leftZ, value: value });
    move()
  });

  rightZFlexSensor.on("read", function(err, value){
    var a = five.Fn.map(value, 500, 200, -60, 60)
    rightZ = five.Fn.constrain(a, -60, 60)
    io.sockets.emit('rightZ', { angle: rightZ, value: value });
    move()
  });

});
