// JavaScript File
var laser = require('../readertrigger/laser');
var lidar = require('../readertrigger/lidarReader');

var sd = (function ()
{
    var me = {};
    
    me.showDistance = function(req, res)
    {
        console.log('Request showDistance');
        var res_obj = {};
        res_obj.no_vehicle = lidar.distance();
        res_obj.laser_status = laser.status();
        res.json(res_obj);
    }
    
    return me;
}());

module.exports = sd;