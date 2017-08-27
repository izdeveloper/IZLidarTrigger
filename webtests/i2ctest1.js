// JavaScript File
var i2c = require('/usr/local/lib/node_modules/bonescript/node_modules/i2c');
var Q = require('q');

var i2c2 ; 
var LIDAR_ADDR = 0x62;
var device = {device: '/dev/i2c-1', debug: false};
var wire = new i2c(LIDAR_ADDR, device);

// reset
wire.write([0x00,0x00], function (err){  
    if (err != null )
        console.log(err)
    else
    {
        // wait for reset to finish and start the program
        setTimeout(startReads, 200);
    }
    
});

function startReads()
{
    Q.fcall(function() {
        var deferred = Q.defer();
        wire.write([0x00,0x04], function (err)
        {
            if (err != null)
            {
                deferred.reject(err);
                return;
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
                return;
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
                return;
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
    .then (function(){ // write addres of the  lower byte to read
        var deferred = Q.defer();
        
        wire.write([0x90], function(err){
            
            if (err != null )
            {
                deferred.reject(err);
                return;
            }
            deferred.resolve();
        });
        
        return deferred.promise;
    })
    .then(function(){
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
                return;
            }
            deferred.resolve(res);
        });
        
        return deferred.promise;
    })
    .then(function(r0){
        var deferred = Q.defer();
        wire.read(1, function(err, res){
         //   console.log("err="+err); 
         var d  = res<<8 | r0;
        // if ( d < 170)
            console.log("d="+d); 
        deferred.resolve();
        });
        return deferred.promise;
    })
    .fail(function(err) {
        
        console.log(err);
    });
    
    setTimeout(startReads, 50);
}
    