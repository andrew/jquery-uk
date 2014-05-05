var five = require("johnny-five"),
    arDrone = require('ar-drone'),
    board = new five.Board(),
    client  = arDrone.createClient();

board.on("ready", function() {
  client.takeoff();
});
