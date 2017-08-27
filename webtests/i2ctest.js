// JavaScript File
var i2c = require('i2c-bus');

var i2c2 ; 
var LIDAR_ADDR = 0x62;

 function initI2C ()
{
    i2c2 = i2c.openSync(1);
   // i2c2.writeByteSync(LIDAR_ADDR, 0x00, 0x00);
}

function readData()
{
    // Set I2C to read
    const buffer = new Buffer(2);
    
    var command_read_with_bias = new Buffer([ 0x00, 0x04 ]);
    i2c2.writeByteSync(LIDAR_ADDR, 0x00, 0x04);
    
    // Wait while lidar does aquisition  
   while (true)
   {
       var b = i2c2.readByteSync(LIDAR_ADDR, 0x04);
       console.log("state = "+b);
       if ( (b & 0x01) == 0x00 ) break;
   }
   
   // read result
   var r1  = i2c2.readByteSync(LIDAR_ADDR, 0x0f);
   var r2  = i2c2.readByteSync(LIDAR_ADDR, 0x90);
   r2  = i2c2.readByteSync(LIDAR_ADDR, 0x90);
   
   console.log("r1="+r1);
   console.log("r2="+r2);
   
   var m  = r2<<8 | r1;
   
   return m;
}
    
    
function lidarReader()
{
     var r = readData();
     
     
    // console.log("d= "+ r);
     setTimeout(lidarReader, 50);
}

initI2C();


lidarReader();
