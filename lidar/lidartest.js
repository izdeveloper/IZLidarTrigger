// JavaScript File
var lidar = require('./readertrigger/lidarReader');
var test = require('./test1');


setInterval(function() {
    
    lidar.startRead();
    var d = lidar.distance();
    console.log("m="+d);
}, 50);

test.start();