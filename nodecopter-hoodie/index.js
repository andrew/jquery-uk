var five = require("johnny-five"),
    arDrone = require('ar-drone'),
    client  = arDrone.createClient();

five.Board().on("ready", function(){
  var leftFlexSensor = new five.Sensor("A0");

  // client.takeoff();

  leftFlexSensor.on("read", function(err, value){
    console.log(value)
    // go left or right etc
  });
});
