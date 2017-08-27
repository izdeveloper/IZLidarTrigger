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





ts.init("192.168.1.245", 10305, false, 50, false, true);

ts.Start();

var triggerEmitter = new EventEmitter.EventEmitter();

triggerEmitter.on('trigger', ts.sendTrigger);


var startTriggerSender  = setInterval(
function()
{  
    if (ts.status() == true)
    {
        console.log('Starting sending trigger');
        clearInterval(startTriggerSender);
        triggerSend();
    }
}, 1000);



function triggerSend()
{
    setInterval(function(){
        triggerEmitter.emit('trigger', 'exit');
        console.log('TRIGGER SENT');
    }, 1500)
}


// lidar.startLidar();
// JavaScript File