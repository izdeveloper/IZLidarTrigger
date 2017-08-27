// JavaScript File

var _rebootTime = "";
var _lidarStatus = false;
var _cameraStatus = false;
var _totalTriggers = 0;

var systemstatus = (function () {
    var me = {};
    
    me.init = function()
    {
        var _t = Date.now();
        _rebootTime = new Date(_t).toString();
    }
    
    me.getCameraStatus = function()
    {
        return _cameraStatus;
    }
    
    me.setCameraStatus = function(status)
    {
        _cameraStatus = status;
    }
    
    me.getLidarStatus = function()
    {
        return _lidarStatus;
    }
    
    me.setLidarStatus = function(status)
    {
        _lidarStatus = status;
    }
    
    me.getTotalTriggers = function()
    {
        return _totalTriggers;
    }
    
    me.addTriggerCount = function()
    {
        _totalTriggers++;
    }
    
    me.systemStatus = function(req, res)
    {
         var ss = {"rt":_rebootTime, "ls":_lidarStatus, "cs":_cameraStatus, "tt":_totalTriggers};
         res.json(ss);
    }
    
    return me;
}());

module.exports = systemstatus;