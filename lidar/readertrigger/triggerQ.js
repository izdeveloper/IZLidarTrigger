// JavaScript File
var _triggerq_size;
var _triggers = [];



var triggerq = (function () {
    var me = {};
    
    me.init = function(size)
    {
        _triggerq_size = size;
        
    };
    
    me.add = function(trigger_type, distance, timestamp)
    {
        if (_triggers.length == _triggerq_size)
        {
            _triggers.shift();
        }
        _triggers.push({"tp":trigger_type, "d":distance, "ts":timestamp});
            
    };
    
    me.triggersJSON = function()
    {
        return JSON.stringify(_triggers);
    }
    
    me.triggers = function()
    {
        return _triggers;
    }
    
    return me;
}());

module.exports = triggerq;