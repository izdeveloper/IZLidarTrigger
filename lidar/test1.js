// JavaScript File
var lidar = require('./readertrigger/lidarReader');


var tc = (function ()
{
    var me = {};
    
    me.start = function()
    {
      setInterval(function() { console.log("t="+ lidar.distance())}, 50);
    };
    
    return me;
}());

module.exports = tc;
