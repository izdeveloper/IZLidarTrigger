// JavaScript File
var EventEmitter = require('events');
var lidar = require('./lidarReader');
var ts = require('./triggersender');
var led = require("./led");
var ts = require('./triggersender');
var trgs = require("./triggerQ");
var triggerconf = require("../triggerconfig.js");


var pl = (function ()
{
    var me = {};

    var  LastDistance;
    var _minValueNoVehicle;
    var _lasttriggertime = 0;
    var _stoppedVehicleHappened;
    var _rearDistanceTrigger = false;

    var _setNoVehicleDistance = 0;
    var _setNoVehicleDistance_Disable = true;
    var _noVehicleTriggerHappened = false;
    var _setFrontLPDistance = 0;
    var _setFrontLPDistance_Disable = true;
    var _frontVehicleTriggerHappened = false;
    var _setRearLPDistance = 0;
    var _setRearLPDistance_Disable = true;
    var _lastMeasuredDistance = 0;
    var _setEmptyDistance = 1000;
    var _emptyDistance = false;


    // Lidar and distance setting / configuration 
    var _sensitivity = 5;
    var _triggerSensitivity = 15;
    var _triggerRearSensitivity = 10;
    
    // Timer for stop triggers
    var _trigger_time = 0; 
    var _stringTime = '';
    
    // Emiter for trigger sender
    var _triggerEmitter;
    
    var _cameraIP = "";
    var _cameraPort;
    var _cameraTrigger = false;
    var _ttlLength = 50;
    var _ttlTrigger = true;
    var _stopTime = 20000000;
    var _stopTrigger = false;
    
    var _triggerq_size = 10;

        
    me.init = function()
    {
        me.trgConfInit();
        ts.init(_cameraIP, _cameraPort, _cameraTrigger, _ttlLength, _ttlTrigger, _stopTrigger);
        ts.Start();
        _triggerEmitter = new EventEmitter.EventEmitter();
        trgs.init(_triggerq_size);
       _triggerEmitter.on('trigger', ts.sendTrigger);
       _triggerEmitter.on('stop', ts.sendStopTrigger);
        
    };
    
    me.trgConfInit = function()
    {
        _ttlLength = triggerconf.ttl_length;
        _ttlTrigger = triggerconf.ttl_trigger;
        
        _cameraIP = triggerconf.camera_ip;
        _cameraTrigger = triggerconf.camera_trigger;
        _cameraPort = triggerconf.camera_port;
        
         /*
         * Stopped time configuration is in milliseconds,
         * the time resolution is in microseconds,
         * so we have to multiply millisecond by 10000
         * 
         */
        _stopTime = triggerconf.stop_time * 10000;
        _stopTrigger = triggerconf.stop_trigger;
        
        _setEmptyDistance = triggerconf.set_empty_vehicle;
        
        _setNoVehicleDistance = triggerconf.set_no_vehicle;
        _setNoVehicleDistance_Disable = triggerconf.set_no_vehicle_disabled;
        _minValueNoVehicle = _setNoVehicleDistance - 20;        

        _setFrontLPDistance = triggerconf.set_front_vehicle;
        _setFrontLPDistance_Disable = triggerconf.set_front_vehicle_disabled; 
        
        _setRearLPDistance = triggerconf.set_rear_vehicle;
        _setRearLPDistance_Disable = triggerconf.set_rear_vehicle_disabled;        
    }
    
    me.setTTLTriger = function(ttlLength, ttlTrigger)
    {
        _ttlLength = ttlLength;
        _ttlTrigger = ttlTrigger;
    };

    me.setIPTrigger = function(cameraIP, cameraPort, cameraTrigger)
    {
        _cameraIP = cameraIP;
        _cameraTrigger = cameraTrigger;
        _cameraPort = cameraPort;
    };

    me.setStopTrigger = function(stopTime, stopTrigger)
    {
        /*
         * Stopped time configuration is in milliseconds,
         * the time resolution is in microseconds,
         * so we have to multiply millisecond by 10000
         * 
         */
        _stopTime = stopTime * 10000;
        _stopTrigger = stopTrigger;

    };
    
    me.setEmptyDistance=  function(distance)
    {
        _setEmptyDistance = distance;
    };

    me.setNoVehicleDistance = function(distance, disable)
    {
        _setNoVehicleDistance = distance;
        _setNoVehicleDistance_Disable = disable;
        _minValueNoVehicle = _setNoVehicleDistance - 20;
    };

    me.setFrontLPDistance  = function(distance, disable)
    {
        _setFrontLPDistance = distance;
        _setFrontLPDistance_Disable = disable;
    };

    me.setRearLPDistance = function(distance, disable)
    {
        _setRearLPDistance = distance;
        _setRearLPDistance_Disable = disable;
    };
    
    
    me.startProcessing = function()
    {
        
        setInterval(me.processLidarRead, 30);
    };
    
    me.processLidarRead = function()
    {
        _trigger_time = Date.now();
        var d = new Date(_trigger_time);
        _stringTime = d.getHours()+':'+d.getMinutes()+':'+d.getSeconds()+'.'+d.getMilliseconds();
        lidar.startRead();
        LastDistance= lidar.distance();
        // console.log(LastDistance);
        if (isNaN(LastDistance) || (LastDistance < 5) || (LastDistance > 2000) )
            return;
            
        // to prevent multiple triggers from one vehicle , we will only fire 
        // trigger if there was empty distance measured between vehicles
        if ( (LastDistance >= _setEmptyDistance - _sensitivity)
                        &&
                (LastDistance <= _setEmptyDistance+_sensitivity ))
            {
                _emptyDistance = true;
            }
        
        
        // NO VEHICLE DISTANCE: process trigger for the case that is something in the FOV of view 
        if (_setNoVehicleDistance_Disable === false )
        {
            // If last measured distance less than the distance considered to be a vehicle in FOV
            // record it and decide if a trigger has to be sent
            if (LastDistance < _minValueNoVehicle + _sensitivity)
            {
                if (_noVehicleTriggerHappened == false)
                {
                    if (_emptyDistance == true)
                    {
                        _lasttriggertime = _trigger_time;
                        _stoppedVehicleHappened = false;
                        console.log("No Vehicle Trigger: " + LastDistance + " " + _stringTime);
                        trgs.add('no vehicle', LastDistance, _stringTime);
                        led.onRed();
                        setTimeout(function(){led.offRed()}, 30);
                        // Sent notification to the trigger thread
                        if (ts.status() == true)
                        {
                            _triggerEmitter.emit("trigger", _trigger_time);
                        }
                        _emptyDistance = false;
                    }
                }
                _noVehicleTriggerHappened = true;
                // if time when trigger happend first is greater than N then consider this as a stop event 
                if (_trigger_time - _lasttriggertime > _stopTime)
                {
                    if (!_stoppedVehicleHappened)
                    {
                        console.log("Stopped Vehicle Trigger: " + LastDistance);
                        trgs.add('stopped vehicle', LastDistance, _stringTime);
                        // Sent notification to the trigger thread that vehicle stopped 
                        if (ts.status() == true)
                        {
                            _triggerEmitter.emit("stop", _trigger_time);
                        }
                    }
                    _stoppedVehicleHappened = true;
                }
            }
                                    
            // if mesuared distance is significanlty different from the previuos measured
            // distance, then consider it as a new trigger event 
            else
            {
                if (LastDistance > _minValueNoVehicle +_triggerSensitivity)
                {
                    _noVehicleTriggerHappened = false;
                    _stoppedVehicleHappened = false;
                }
            }
            _lastMeasuredDistance = LastDistance;
        }
    
        // FRONT LP DISTANCE: process trigger for the front plates detection 
        if (_setFrontLPDistance_Disable == false)
        {
            // if we found a vehicle in the right distance , we can consider it as a trigger for the front license plate 
            if ( (LastDistance >= _setFrontLPDistance - _sensitivity)
                        &&
                (LastDistance <= _setFrontLPDistance+_sensitivity ))
            {
                if (_frontVehicleTriggerHappened == false)
                {
                    if (_emptyDistance == true)
                    {
                        _lasttriggertime = _trigger_time;
                        _stoppedVehicleHappened = false;
                        console.log("Front Trigger: " + LastDistance + " " + _stringTime);
                        trgs.add('Front LP', LastDistance, _stringTime);
                        led.onRed();
                        setTimeout(function(){led.offRed()}, 30);
                        
                        // Sent notification to the trigger thread
                        if (ts.status() == true)
                        {
                            _triggerEmitter.emit("trigger", _trigger_time);
                        }
                        _emptyDistance = false;
                    }
                }
                _frontVehicleTriggerHappened = true;
                                    
                // if time when trigger happened first is greater than N then consider this as a stop event 
                if (_trigger_time - _lasttriggertime > _stopTime)
                {
                    if (!_stoppedVehicleHappened)
                    {
                        console.log("Stopped Vehicle Trigger: " + LastDistance);
                        trgs.add('Front stopped LP', LastDistance, _stringTime);
                        // Sent notification to the trigger thread that vehicle stopped 
                        if (ts.status() == true)
                        {
                            _triggerEmitter.emit("stop", _trigger_time);
                        }
                    }
                    _stoppedVehicleHappened = true;
                    // _lasttriggertime = time.Ticks;
                }
            } 
            else
            {
                if ( (LastDistance < _setFrontLPDistance - _triggerSensitivity)
                    ||
                     (LastDistance > _setFrontLPDistance + _triggerSensitivity))
                                        
                {
                    _frontVehicleTriggerHappened = false;
                    _stoppedVehicleHappened = false;
                }
            }
            _lastMeasuredDistance = LastDistance;
        }
        // REAR LP DISTANCE:  process trigger for rear plates detection
        if (_setRearLPDistance_Disable == false)
        {
            // if we found a vehicle in the right distance , we consider it as a start of REAR LP trigger
            // the first time when we see that the distance is longer than it was for the rear 
            // plate configured distance , we will consioder it as a trigger
            if ((LastDistance > _setRearLPDistance - _sensitivity)
                &&
                (LastDistance < _setRearLPDistance + _sensitivity))
            {
                _rearDistanceTrigger = true;
                if (_trigger_time - _lasttriggertime > _stopTime)
                {
                    if (!_stoppedVehicleHappened)
                    {
                        console.log("Stopped Vehicle Trigger: " + LastDistance);
                        trgs.add('Rear Stopped LP', LastDistance, _stringTime);
                        // Sent notification to the trigger thread that vehicle stopped 
                        if (ts.status() == true)
                        {
                            _triggerEmitter.emit("stop", _trigger_time);
                        }
                    }
                    _stoppedVehicleHappened = true;
                }
            }
            // if mesuared distance is not equal to the rear distance measured
            // , then check the vehicle was in FOV and now leaving (rear lp case) 
            else
            {
                // if the distance is more than rear LP distance and the previuos measured distance was at rear LP distance , 
                // then consider it is as a new trigger
                if ((LastDistance > _setRearLPDistance + _triggerRearSensitivity) && (_rearDistanceTrigger == true))
                {
                    console.log("Rear Trigger: " + LastDistance + " " + _stringTime);
                    trgs.add('Rear Trigger', LastDistance, _stringTime);
                    led.onRed();
                    setTimeout(function(){led.offRed()}, 30);
                    
                    // Sent notification to the trigger thread
                    if (ts.status() == true)
                    {
                        _triggerEmitter.emit("trigger", _trigger_time);
                    }
                    _rearDistanceTrigger = false;
                     _stoppedVehicleHappened = false;
    
                }
            }
            _lastMeasuredDistance = LastDistance;
        }
    }
    
    return me;
}());

module.exports = pl;