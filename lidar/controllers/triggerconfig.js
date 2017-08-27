// JavaScript File
var fs = require('fs');



var tc = (function ()
{
    var me = {};
    
    me.init = function() 
    {
        // check if file exists
        if (fs.existsSync("triggerconfig.js") == false) 
        {
            var obj = 
                    {
                        set_front_vehicle: 400,
                        set_rear_vehicle: 400,
                        set_no_vehicle: 400,
                        set_no_vehicle_disabled: false,
                        set_front_vehicle_disabled: true,
                        set_rear_vehicle_disabled: true,
                        camera_ip: "0.0.0.0",
                        camera_port: "13000",
                        camera_trigger: "0",
                        ttl_length: 50,
                        ttl_trigger: "1",
                        stop_time: 2000,
                        stop_trigger: "1",
                    };
            fs.writeFileSync('triggerconfig.js', 'module.exports = '+JSON.stringify(obj));
        }
    }
    
    me.showTrigger = function(req,res)
    {
        console.log("showTrigger request");
        
        // check if file exists
        if (fs.existsSync("triggerconfig.js") == false) 
        {
            var obj = 
                    {
                        set_empty_vehicle: 1000,
                        set_front_vehicle: 400,
                        set_rear_vehicle: 400,
                        set_no_vehicle: 400,
                        set_no_vehicle_disabled: false,
                        set_front_vehicle_disabled: true,
                        set_rear_vehicle_disabled: true,
                        camera_ip: "0.0.0.0",
                        camera_port: "13000",
                        camera_trigger: "0",
                        ttl_length: 50,
                        ttl_trigger: "1",
                        stop_time: 2000,
                        stop_trigger: "1",
                    };
            fs.writeFileSync('triggerconfig.js', 'module.exports = '+JSON.stringify(obj));
        }
        
        var triggerconfig = require('../triggerconfig');
        res.json(triggerconfig);
    };
    
    me.saveTrigger = function(req, res)
    {
        console.log("saveTrigger request");
        
        var obj = {};
        obj.set_empty_vehicle = parseInt(req.query.set_empty_vehicle);
        obj.set_front_vehicle=parseInt(req.query.set_front_vehicle);
        obj.set_rear_vehicle=parseInt(req.query.set_rear_vehicle);
        obj.set_no_vehicle=parseInt(req.query.set_no_vehicle);
        obj.set_no_vehicle_disabled=req.query.set_no_vehicle_disabled === "true";
        obj.set_front_vehicle_disabled=req.query.set_front_vehicle_disabled === "true";
        obj.set_rear_vehicle_disabled=req.query.set_rear_vehicle_disabled === "true";
        obj.camera_ip=req.query.camera_ip;
        obj.camera_port=req.query.camera_port;
        obj.camera_trigger=req.query.camera_trigger;
        obj.ttl_length=parseInt(req.query.ttl_length);
        obj.ttl_trigger=req.query.ttl_trigger;
        obj.stop_time=parseInt(req.query.stop_time);
        obj.stop_trigger=req.query.stop_trigger;
        
        fs.writeFileSync('triggerconfig.js', 'module.exports = '+JSON.stringify(obj));
        
        res.json({ok:'ok'});
    }
    
    return me;
}());

module.exports = tc;