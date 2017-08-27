// JavaScript File
var b = require('/usr/local/lib/node_modules/bonescript');


var led = (function () {
    var me = {};
    
    var leds = ["P8_8", "P8_10", "P8_12"];
    // RED BLUE GREEN
    var ledsOn = {P8_8:false, P8_10:false, P8_12:false};
    
    for(var i in leds) 
    {
        b.pinMode(leds[i], b.OUTPUT);
    }
    
    me.setAllOff = function()
    {
        for(var i in leds) 
        {
            b.digitalWrite(leds[i], b.LOW);
            ledsOn[leds[1]] = false;
        }
    };
    
    me.setRed = function()
    {
        me.setAllOff();
        b.digitalWrite(leds[0], b.HIGH);
        ledsOn[leds[0]] = true;
    };
    
    me.setBlue = function()
    {
        me.setAllOff();
        b.digitalWrite(leds[1], b.HIGH);
        ledsOn[leds[1]] = true;
    }
    
    me.setGreen = function()
    {
        me.setAllOff();
        b.digitalWrite(leds[2], b.HIGH);
        ledsOn[leds[2]] = true;
    }
    
    me.onRed = function()
    {
        b.digitalWrite(leds[0], b.HIGH);
        ledsOn[leds[0]] = true;
    };
    
    me.offRed = function()
    {
        b.digitalWrite(leds[0], b.LOW);
        ledsOn[leds[0]] = false;
        me.ledBack();
    };  
    
    me.onBlue = function()
    {
        b.digitalWrite(leds[1], b.HIGH);
        ledsOn[leds[1]] = true;
    }
    me.offBlue = function()
    {
        b.digitalWrite(leds[1], b.LOW);
        ledsOn[leds[1]] = false;
        me.ledBack();
    }  
    
    me.onGreen = function()
    {
        b.digitalWrite(leds[2], b.HIGH);
        ledsOn[leds[2]] = true;
    }
    me.offGreen = function()
    {
        b.digitalWrite(leds[2], b.LOW);
        ledsOn[leds[2]] = false;
        me.ledBack();
    } 
    
    me.ledBack = function()
    {
        for (var i in leds) 
        {
            if (ledsOn[leds[i]] === true)
                b.digitalWrite(leds[i], b.HIGH);
        }
    }
    
    return me;
}());

module.exports = led;