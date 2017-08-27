// JavaScript File
var b = require('/usr/local/lib/node_modules/bonescript');
var _laserStatus = false;

var laser = (function ()
{
    var _laserPin = "P8_16";
    var me = {};

    
    var _timerToSwitchOff = 10 * 60 * 1000;  // 10 minutes time out for automatic laser turn off
    
    b.pinMode(_laserPin, b.OUTPUT);
    
    me.status = function() 
    {
        return _laserStatus;
    }
    
    me.laserOn = function()
    {
      console.log('Request laserOn: '+_laserStatus);
        if (_laserStatus === false )
        {
 
            b.digitalWrite(_laserPin, b.HIGH);
            _laserStatus = true;
            setTimeout(me.laserOff, _timerToSwitchOff);
        }
    };
    
    me.laserOff = function()
    {
        console.log('Request laserOff: '+_laserStatus);
        b.digitalWrite(_laserPin, b.LOW);
        _laserStatus = false;   
    };
    
    return me;
}());

module.exports = laser;