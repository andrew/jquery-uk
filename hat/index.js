var Spark = require("spark-io");
var board = new Spark({
  token: "e2a5a52f9a78800176df63038ff4aa45df9f1d8c",
  deviceId: "53ff70065067544845591187"
});

board.on("ready", function() {
  console.log("CONNECTED");

  var byte = 0;

  setInterval(function() {
    console.log("message", byte);
    this.digitalWrite("D7", (byte ^= 1));
  }.bind(this), 500);
});