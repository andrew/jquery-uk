var Sparky = require('sparky')

var core1 = new Sparky({
    deviceId: '50ff6b065067545622150387',
    token: '9d1342f907685e3f371c3f79efed2f7bbd173f2d',
})

core1.run('ledon', 'D0', function(e){
  console.log(e)
});

setTimeout(function(){
    core1.run('ledoff', 'D0', function(e){
      console.log(e)
    });
}, 2000)

var i = 0
setInterval(function() {
    core1.run('servo', i, function(e,d){
      console.log(e,d)
    });
    i+=1
},100)
