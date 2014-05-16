var Sparky = require('sparky')

var core1 = new Sparky({
    deviceId: '50ff6b065067545622150387',
    token: '9d1342f907685e3f371c3f79efed2f7bbd173f2d',
})

var Twit = require('twit')

var T = new Twit({
    consumer_key:         'fgO7FlHNn734ulAMuDUCZOoH2'
  , consumer_secret:      '0YWo6yWD9o3Osx9NxLQkhJvemHd6lnWJJdx5NjhH2ClAWsOnXI'
  , access_token:         '686803-SckzWhXA2wAsHfOKmMAqnD13TstssPCVA0ohCHe7Cyd'
  , access_token_secret:  'c6dtSJuYRXUUtBTNtmX7WEFi2cwb8UQTSnJQJ9hm5LIW1'
})

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

var keyword = 'jqukhat' // try google for testing
var count = 0;
var max = 40;
var LEDcount = 5;
var range = max / LEDcount;
var activeLEDs = []
var LEDs = ['D0', 'D1', 'D2', 'D3', 'D4']
var servoRaised = false;

var stream = T.stream('statuses/filter', { track: keyword })

app.get("/", function(req, res) {
  return res.render('index.ejs', {hashtag: keyword});
});

var port = process.env.PORT || 5300;
app.listen(port);
console.log("Listening on Port '" + port + "'");

var io = require('socket.io').listen(8002);



reset()

stream.on('tweet', updateCount)

function updateCount(tweet) {
  // push avatar and count over websocket
  count += 1
  console.log(count)
  io.sockets.emit('count', count)

  // turn on portion of LEDs
  activateLEDs()

  // raise servo arm when we reach the goal
  if(count>=max && servoRaised === false){
    raiseServo()
    // flashLEDs()
  }
}

function raiseServo() {
  console.log('raise Servo')
  setTimeout(function(){
    core1.run('servo', 105, function(resp){});
  }, 1000)
  servoRaised = true
}

function activateLEDs() {
  inactive = Math.floor((max-count)/range)

  current = LEDcount - inactive - 2

  if(current > -1){
    port = 'D' + current
    if(activeLEDs.indexOf(port) < 0){
      activeLEDs.push(port)
      console.log(port, 'on')
      core1.run('ledon', port, function(e){});
    }
  }
}

function reset(){
  LEDs.forEach(function (value, index) {
    console.log(value, 'off')
    core1.run('ledoff', value, function(e){});
  });
  core1.run('servo', 15, function(resp){});
}

function flashLEDs(){
  LEDs.forEach(function (value, index) {
    setInterval(function() {
      // on
      console.log(value, 'on')
      core1.run('ledon', value, function(e){});
      setTimeout(function(){
        // off
        console.log(value, 'off')
        core1.run('ledoff', value, function(e){});
      }, 1500)
    }, 3000)
  });
}
