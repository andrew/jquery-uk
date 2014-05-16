var five = require("johnny-five"),
    arDrone = require('ar-drone'),
    serialport = require('serialport'),
    droneControl = arDrone.createUdpControl();

var ref = {fly: false}
var pcmd = {};

var speed = 0.2;

function takeoff() {
  console.log('taking off')
  ref.fly = true;
  ref.emergency = false;
}

function land() {
  console.log('landing')
  pcmd = {};
  ref.fly = false;
  ref.emergency = true;
}

function toggleFlying(){
  if(ref.fly){
    land()
  } else {
    takeoff()
  }
}

setInterval(function() {
  droneControl.ref(ref);
  droneControl.pcmd(pcmd);
  droneControl.flush();
}, 30);

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

var port = process.env.PORT || 5200;
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
    pcmd.up = speed;
    pcmd.left = 0;
  }
  // down
  else if(left < lowerLimit && right < lowerLimit){
    command = 'down'
    pcmd.down = speed;
    pcmd.left = 0;
  }
  // left
  else if(left < lowerLimit && right > upperLimit){
    command = 'left'
    pcmd.up = 0;
    pcmd.left = speed;
  }
  // right
  else if(left > upperLimit && right < lowerLimit){
    command = 'right'
    pcmd.up = 0;
    pcmd.right = speed;
  }
  // hover
  else {
    command = 'hover'
    pcmd.down = 0;
    pcmd.left = 0;
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
    pcmd.front = speed;
    pcmd.clockwise = 0;
  }
  // down
  else if(left < lowerLimitZ && right < lowerLimitZ){
    command = 'back'
    pcmd.back = speed;
    pcmd.clockwise = 0;
  }
  // left
  else if(left < lowerLimitZ && right > upperLimitZ){
    command = 'clockwise'
    pcmd.front = 0;
    pcmd.clockwise = speed;
  }
  // right
  else if(left > upperLimitZ && right < lowerLimitZ){
    command = 'counterClockwise'
    pcmd.front = 0;
    pcmd.counterClockwise = speed;
  }
  // hover
  else {
    command = 'hover'
  }
  io.sockets.emit('commandZ', {command: command, left: left, right: right});
}


var onReady = function(){
  console.log("ready to robot");
  var button = new five.Button(7);
  var leftYFlexSensor = new five.Sensor("A0");
  var rightYFlexSensor = new five.Sensor("A1");
  var leftZFlexSensor = new five.Sensor("A2");
  var rightZFlexSensor = new five.Sensor("A3");

  button.on("up", function() {
    // console.log("up");
    toggleFlying();
  });


  leftYFlexSensor.on("read", function(err, value){
    var a= five.Fn.map(value, 100, 500, -90, 90);
    leftY = five.Fn.constrain(a, -80, 80);
    io.sockets.emit('leftY', { angle: leftY, value: value });
    move();
  });
  rightYFlexSensor.on("read", function(err, value){
    var a = five.Fn.map(value, 400, 100, -90, 90);
    rightY = five.Fn.constrain(a, -80, 80);
    io.sockets.emit('rightY', { angle: rightY, value: value });
    move();
  });

  leftZFlexSensor.on("read", function(err, value){
    var a= five.Fn.map(value, 550, 330, -60, 60);
    leftZ = five.Fn.constrain(a, -60, 60);
    io.sockets.emit('leftZ', { angle: leftZ, value: value });
    move();
  });

  rightZFlexSensor.on("read", function(err, value){
    var a = five.Fn.map(value, 500, 200, -60, 60);
    rightZ = five.Fn.constrain(a, -60, 60);
    io.sockets.emit('rightZ', { angle: rightZ, value: value });
    move();
  });

};


var board;
serialport.list(function(err, ports){
  ports = ports.filter(function(port){
    return port.manufacturer.match(/arduino/i);
  });
  console.log(ports);

  var arduino = ports.shift().comName;
  console.log("connecting to " + arduino);
  board = new five.Board({
    port: arduino,
    repl: false,
    debug: true
  });
  board.on("ready", onReady);
});
