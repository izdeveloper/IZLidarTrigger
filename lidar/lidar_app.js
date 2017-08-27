// JavaScript File
// https://coligo.io/building-ajax-file-uploader-with-node/
var express = require('/usr/local/lib/node_modules/bonescript/node_modules/express');
var EventEmitter = require('events');

var lidar = require('./readertrigger/lidarReader.js');
var led = require('./readertrigger/led');
var upload = require('./controllers/upload');
var dir = require('./controllers/dir');
var netconfig = require('./controllers/networkconfig');
var triggerconfig = require('./controllers/triggerconfig');
var reboot = require('./controllers/reboot');
var ts = require('./readertrigger/triggersender');
var pl = require('./readertrigger/processLidar');
var laser = require("./controllers/turnLaser");
var sd = require('./controllers/showDistance');
var trg = require('./controllers/triggers');


var app = express();

// routes
upload.init(app);
app.get('/', function(req, res){
    res.sendfile('website/mainpage.html' , {root: './'});
});
app.get('/upload', upload.getUpload);
app.post('/upload', upload.postUpload);
app.get('/dir', dir.listDir);
app.get('/getnetwork', netconfig.getNetwork);
app.get('/savenetwork', netconfig.saveNetwork);
app.get('/showtrigger', triggerconfig.showTrigger);
app.get('/savetrigger', triggerconfig.saveTrigger);
app.get('/turnonoff', laser.turnLaser);
app.get('/showdist', sd.showDistance);
app.get('/reboot', reboot.Reboot);
app.get('/triggers', trg.triggers);

app.get(/./, dir.getFile);


// init config file 
netconfig.init();
triggerconfig.init();
var data_netconfig = require('./netconfig');
// var data_triggerconfig = require('./triggerconfig');

// configure, start Lidar Reader and Trigger sender
pl.init();

/*
pl.setTTLTriger(data_triggerconfig.ttl_length, data_triggerconfig.ttl_trigger === "1"? false: true);
pl.setIPTrigger(data_triggerconfig.camera_ip, data_triggerconfig.camera_port, data_triggerconfig.camera_trigger === "1"? false: true);
pl.setStopTrigger(data_triggerconfig.stop_time, data_triggerconfig.stop_trigger === "1"? false: true );
pl.setNoVehicleDistance(data_triggerconfig.set_no_vehicle, data_triggerconfig.set_no_vehicle_disabled);
pl.setFrontLPDistance(data_triggerconfig.set_front_vehicle, data_triggerconfig.set_front_vehicle_disabled);
pl.setRearLPDistance(data_triggerconfig.set_rear_vehicle, data_triggerconfig.set_rear_vehicle_disabled);
pl.setEmptyDistance(data_triggerconfig.set_empty_vehicle);
*/

// Start Lidar 
pl.startProcessing();


// start the server
var server = app.listen(5555, function(){
  led.setGreen();
  console.log('Server listening on port 5555');
});

