// JavaScript File
var laser = require('../readertrigger/laser');


var tl = (function ()
{
    var me = {};
    
    me.turnLaser = function(req, res)
    {
        console.log('Request turnLaser: '+req.query.CMD);
        if (req.query.CMD === "on")
            laser.laserOn();
        if (req.query.CMD === "off")
            laser.laserOff()
        
        res.json({ok:'ok'});
    }
    
    return me;
}());

module.exports = tl;