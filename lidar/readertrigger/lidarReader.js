// JavaScript File
var i2c = require('/usr/local/lib/node_modules/bonescript/node_modules/i2c');
var Q = require('q');


var lr = (function () {
    var i2c2 ; 
    var LIDAR_ADDR = 0x62;
    var device = {device: '/dev/i2c-1', debug: false};
    var wire = new i2c(LIDAR_ADDR, device);
    var doReading = true;
    var _distance = 0;

    var me = {};
    
    // return last read distance 
    me.distance = function() {return _distance};
    
    // reset
    me.lidarReset =  function ()
    {
        wire.write([0x00,0x00], function (err){  
            if (err != null )
                console.log(err)
        });
    };
    
    me.stopLidarReads = function ()
    {
        doReading = false;
    };
    
    me.startLidarReads = function ()
    {
        doReading = true;
    };
    
    me.startLidar = function ()
    {
        
        if (doReading == true )
            me.startReads();
            
    };
    
    me.startRead = function ()
    {
        Q.fcall(function() {
            var deferred = Q.defer();
            wire.write([0x00,0x04], function (err)
            {
                if (err != null)
                {
                    deferred.reject(err);
                    return 0;
                }
                deferred.resolve();
            });
            return deferred.promise;
        })
        .then(function(){ // write command to read status of the lidar reading
            var deferred = Q.defer();
            wire.write([0x04], function(err)
            {
                if (err != null)
                {
                    deferred.reject(err);
                    return 1;
                }
                deferred.resolve();
                
            });
            return deferred.promise;
        })
        .then(function(){ // read status 
            var deferred = Q.defer();
            wire.read(1, function(err, res)
            {
                if (err != null )
                {
                    deferred.reject(err);
                    return 2;
                }
                else
                {
                    if ( (res & 0x01) == 0x00 ) 
                        deferred.resolve();
                    else
                        deferred.reject("not ready");
                }
            });
            return deferred.promise;
        })
        .then (function(){ // write address of the  lower byte to read
            var deferred = Q.defer();
            
            wire.write([0x90], function(err){
                
                if (err != null )
                {
                    deferred.reject(err);
                    return 3;
                }
                deferred.resolve();
            });
            
            return deferred.promise;
        })
        .then(function(){ // read lower byte of the taken distance
            var deferred = Q.defer();
            wire.read(1, function(err, res){
             //   console.log("err="+err); 
               // console.log("res1="+res); 
                 deferred.resolve(res);
            });
            return deferred.promise;
        })
        .then(function(res){ // write addres of the  higher byte to read
            var deferred = Q.defer();
            wire.write([0x0f], function(err){
                
                if (err != null )
                {
                    deferred.reject(err);
                    return 4;
                }
                deferred.resolve(res);
            });
            
            return deferred.promise;
        })
        .then(function(r0){ // read higher byte of the taken distance
            var deferred = Q.defer();
            wire.read(1, function(err, res){
             //   console.log("err="+err); 
             var d  = res<<8 | r0;
             //   console.log("d="+d); 
             // filter out bad reads for the GUI
             if (isNaN(d) || (d < 5) || (d > 2000) )
                _distance = _distance; // do nothing 
             else
                _distance = d; 
            deferred.resolve();
            return d;  // return read distance
            // setTimeout(me.startLidar, 50);
            });
            return deferred.promise;
        })
        .fail(function(err) {
            
            console.log(err);
            return -1;
            // setTimeout(me.startLidar, 50);
        });
    }
    return me;
}());

module.exports = lr;