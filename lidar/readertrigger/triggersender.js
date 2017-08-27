// JavaScript File
var net = require('net'); 
var led = require('./led');

var ts = (function ()
{
    
    var me = {};
    
    // ZAP parameters 
    var _msgID = 1;
    var _zver = "4.0"
    var _sendID = 1;
    var _tarID = 999;
    var _zsrc = "";
    var _trID = 1;
    var _zmode = "off";
    
    // Trigger Sender parameters
    var _cameraIP = "";
    var _cameraPort =0;
    var _ttlLength = 50;
    var _cameraTriggerDisabled = true;
    var _ttlTriggerDisabled = true;
    var _stopTriggerDisabled = true;
    var _client ;
    
    // Status 
    var _status = false;
    
    
    me.init = function(cameraIP, cameraPort, cameraTriggerDisabled, ttlLength, ttlTriggerDisabled, stopTriggerDisabled)
    {
        _cameraIP = cameraIP;
        _cameraPort = cameraPort;
        _cameraTriggerDisabled = cameraTriggerDisabled;
        _ttlLength = ttlLength; 
        _ttlTriggerDisabled = ttlTriggerDisabled;
        _stopTriggerDisabled = stopTriggerDisabled;
        _client = new net.Socket();
        _status = false;
    }
    
    me.status = function()
    {
        return _status;
    }
    
    me.Start = function()
    {
        // connect and send ZAP Set channel message
        _client.connect(_cameraPort, _cameraIP, function()
        {
            console.log('CONNECTED TO: ' + _cameraIP + ':' + _cameraPort);
            // send Set Channel message to the Camera
            _client.write(me.getEventChannelMsg(),'binary');
            _status = true;
            led.setBlue();
        });
        
        _client.on('error', function(e) 
        {
            if(e.code == 'ECONNREFUSED') 
            {
                console.log('The Camera with IP=' + _cameraIP + " Port="+_cameraPort+' is not running');
                _client.destroy();
                _client = new net.Socket();
                _client.setTimeout(1000, me.Start );
                console.log('Timeout for 1 second before trying to connect again');
                led.offBlue();
        
            }
            else
                console.log('Cannot connect to IP=' + _cameraIP + " Port="+_cameraPort+' is not running');
            _status = false;
        });
        
        // Processing messages from the camera
        _client.on('data', me.processMessage);
        
        
        _client.on('close', function() 
        {
            _client.destroy();
            _client = new net.Socket();
            console.log('Camera Connection closed, trying to connect again');
            _client.setTimeout(1000, me.Start );
            led.offBlue();
            _status = false;
        });
    }
    
    me.processMessage = function(data)
    {
        // don't do nothing if there is no connection to the server
        if (_status === false)
            return;
            
        // don't process keep alive (0x00) messages
        if (data.length < 3)
            return;
        // get XML message (remove STX and ETX )
        var s  = new Buffer(data.slice(1,data.length-1)).toString('ascii');
        
        var ack = s.indexOf("ACK");
        var ec = s.indexOf("EventChannel");
        var gs = s.indexOf("<GetStatus");
        
        if (ack > -1 )
        {
            // do nothing
            console.log(s);
        }
        
        if (ec > -1)
        {
            console.log(s);
            var ps = s.indexOf("Id");
            var pe = s.indexOf(' ', ps);
            var id  = s.substring(ps,pe).split('=')[1].replace(new RegExp('"', 'g'),'');
            _client.write(me.getACKMsg(id));
        }
        
        if (gs > -1)
        {
            console.log(s);
            var p = s.indexOf(">", gs);
            if (p > -1)
            {
                var xmlgs = s.substring(gs + 1, p - 1);
                var param = xmlgs.split(' ');
                for (var i = 0; i < param.length; i++)
                {
                    var j = param[i].indexOf("RequestId");
                    if (j > -1)
                    {
                        var id = param[i].split('=')[1].replace(new RegExp('"', 'g'),'');
                        _client.write(me.getACKMsg(id));
                        break;
                    }
                }
            }
        }
    }
    
    me.sendTrigger =  function(trigger_type)
    {
        console.log ('Recieved trigger type: '+trigger_type);
        
        // don't do nothing if there is no connection to the server
        if (_status === false)
            return;
            
        if (_cameraTriggerDisabled == false) // send software triggers enabled 
        {
             _client.write(me.getTriggerMsg()); 
        }
        
        if (_ttlTriggerDisabled == false) // send TTL trigger
        {
            led.setRed();
            setTimeout(led.offRed(), _ttlLength);
        }
    }
    
    me.sendStopTrigger = function(trigger_type)
    {
        console.log ('Recieved stop trigger type: '+trigger_type);
        // don't do nothing if there is no connection to the server
        if (_status === false)
            return;
            
        if (_stopTriggerDisabled == false) // send software stop triggers enabled 
        {
             _client.write(me.getTriggerMsg()); 
        }
    }
    
    me.getEventChannelMsg =  function ()
    {
        var t = new Date();
        var rts = t.getFullYear() + "-" + t.getMonth() + "-" + t.getDay() + "T" + t.getHours() + ":" + t.getMinutes() + ":" + t.getSeconds() + "." + t.getMilliseconds() + "+00:00";
        var reqid = _msgID + 1000;
        var s = "";
        s = "<ZapPacket Type=\"MSG\" Id=\"" + _msgID + "\" Version=\"" + _zver + "\" SenderId=\"" + _sendID + "\" TargetId=\"" + _tarID + "\"><SetEventChannel RequestId=\"" + reqid + "\"><RequestTimeStamp>" + rts + "</RequestTimeStamp><Mode>" + _zmode + "</Mode>"
            +"<MemberFilter>all</MemberFilter><ConfidenceFilter>0</ConfidenceFilter><Expiration>300</Expiration><StartTime>2009-02-19T15:39:14.203+02:00</StartTime>" + "</SetEventChannel></ZapPacket>";
        
        _msgID++;
        return me.strToBuffer(s);
    }
    

    me.getTriggerMsg = function()
    {
        var t = new Date();
        var rts = t.getFullYear() + "-" + t.getMonth() + "-" + t.getDay() + "T" + t.getHours() + ":" + t.getMinutes() + ":" + t.getSeconds() + "." + t.getMilliseconds() + "+00:00";
        var reqid = _msgID + 1000;
        var s = "";
        // s = "<ZapPacket Type=\"MSG\" Id=\"" + _msgID + "\" Version=\"" + _zver + "\" SenderId=\"" + _senID + "\" TargetId=\"" + _tarID + "\"><Trigger RequestId=\""+_trID+"\">" +"<RequestTimeStamp>"+rts+"</RequestTimeStamp>" +"<TriggerId>" + _trID + "</TriggerId>"+"<Source>" + _zsrc + "</Source></Trigger></ZapPacket>";
        s = "<ZapPacket Type=\"MSG\" Id=\"" + _msgID + "\" Version=\"" + _zver + "\" SenderId=\"" + _sendID + "\" TargetId=\"" + _tarID + "\"><Trigger RequestId=\"" + _trID + "\"><TriggerId>" + _trID + "</TriggerId>" + "<Source>" + _zsrc + "</Source></Trigger></ZapPacket>";
        _msgID++;
        _trID++;
        return  me.strToBuffer(s);
    }
        
    me.getACKMsg = function(id)
    {
        var reqid = _msgID + 1000;
        var s = "";
        s = "<ZapPacket Type=\"ACK\" Id=\"" + id + "\" Version=\"" + _zver + "\" SenderId=\"" + _sendID + "\" SenderName=\"Trigger 1\" SenderSysType=\"ThirdParty\" SenderVersion=\"1\"></ZapPacket>";
        _msgID++;
        return  me.strToBuffer(s);
    }

    me.getStatusMsg = function(requestid)
    {
        var t = new Date();
        var rts = t.getFullYear() + "-" + t.getMonth() + "-" + t.getDay() + "T" + t.getHours() + ":" + t.getMinutes() + ":" + t.getSeconds() + "." + t.getMilliseconds() + "+00:00";
        var reqid = _msgID + 1000;
        var s = "";
        s = "<ZapPacket Type=\"MSG\" Id=\"" + _msgID + "\" Version=\"" + _zver + "\" SenderId=\"" + _sendID + "\"><Status RequestId=\"" + requestid + "\" Severity=\"information\"><GetStatus RequestId=\"" + requestid + "\"><RequestTimeStamp>" + rts + "</RequestTimeStamp></GetStatus><TimeStamp>" + rts + "</TimeStamp></Status></ZapPacket>";
        _msgID++;
        _trID++;
        return  me.strToBuffer(s);
    }
    
    me.strToBuffer =function(s)
    {
        var bs = new Buffer(s.length+2);
        bs[0] = 2; //STX 
        bs[bs.length-1] = 3; //ETX
        for (var i = 0;  i < s.length; i++)
        {
            bs[i+1] = s.charCodeAt(i);
        }
        return bs;
    }
    
    return me;
    
}());

module.exports = ts;