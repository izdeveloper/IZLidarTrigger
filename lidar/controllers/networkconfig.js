// JavaScript File
var network = require('network-config');


var fs = require('fs');



var nc = (function ()
{
    var me = {};
    
    me.init = function()
    {
        // check if the file exists
        if (fs.existsSync("netconfig.js") == false) 
        {
            var obj = 
                    {
                        static_ip: "192.168.5.200",
                        network_mask: "255.255.255.0",
                        gateway: "192.168.5.1",
                        ntp: "0.0.0.0",
                        dhcp: "0",
                        timezone: "15",
                        timezone_val: "-5",
                        web_port: "8080",
                        username: "root",
                        password: "root"
                    };
            fs.writeFileSync('netconfig.js', 'module.exports = '+JSON.stringify(obj));
        }        
    }
    
    me.getNetwork = function(req,res)
    {
        console.log("getNetwok request");
        // check if the file exists
        if (fs.existsSync("netconfig.js") == false) 
        {
            var obj = 
                    {
                        static_ip: "192.168.5.200",
                        network_mask: "255.255.255.0",
                        gateway: "192.168.5.1",
                        ntp: "0.0.0.0",
                        dhcp: "0",
                        timezone: "15",
                        timezone_val: "-5",
                        web_port: "8080",
                        username: "root",
                        password: "root"
                    };
            fs.writeFileSync('netconfig.js', 'module.exports = '+JSON.stringify(obj));
        }
        
        var netconfig = require('../netconfig');
        // console.log(JSON.stringify(netconfig));
        
        network.interfaces(function(err, iface)
        {
            if (err !== null )
            {
                res.status(404).send(err);
                return;
            }
            
            iface.forEach(function(intface)
            {
                // console.log(intface);
                if (intface.name === 'eth0')
                {
                    netconfig.static_ip = intface.ip;
                    netconfig.network_mask = intface.netmask;
                    netconfig.gateway = intface.gateway;
                }
            });
            res.json(netconfig);
        });
    }
    
    me.saveNetwork = function(req, res)
    {
        console.log("saveNetwork request");
        var netconfig = require('../netconfig');
        netconfig.static_ip = req.query.static_ip;
        netconfig.network_mask = req.query.network_mask;
        netconfig.gateway = req.query.gateway;
        netconfig.ntp = req.query.ntp;
        netconfig.dhcp = req.query.dhcp
        netconfig.timezone = req.query.timezone;
        netconfig.timezone_val = req.query.timezone_val;
        netconfig.web_port = req.query.web_port;
        netconfig.username = req.query.username;
        netconfig.password = req.query.password;
        
        if (req.query.date_time_value !== "")
        {
            console.log("Setting up time: "+ req.query.date_time_value);
            //TODO set up system time
        }
        
        //setting time zone
        var tz = 'ln -fs /usr/share/zoneinfo/Etc/GMT'+netconfig.timezone_val+' /etc/localtime';
        require('child_process').exec(tz,function (msg) { console.log(msg) });
        
        fs.writeFileSync('netconfig.js', 'module.exports = '+JSON.stringify(netconfig));
        
        if (netconfig.dhcp === '0') // static ip configuration, dhcp is set to none
        {
            network.configure('eth0', 
            {
                ip: netconfig.static_ip,
                netmask:netconfig.network_mask,
                gateway: netconfig.gateway    
            }, function(err)
                {
                    res.status(404).send(err);
                    return;
            });
        }
        else
        {
            network.configureDHCP('eth0', { }, 
            function(err)
            {
                res.status(404).send(err);
                return;
            });
        }
        // console.log(JSON.stringify(netconfig));
        res.json(netconfig);
        
        
    }
    
    return me;
}());


module.exports = nc;


/*
network.interfaces(function(err, iface){console.log(iface);});

*/

/*
network.configure('eth0', {
    ip: '192.168.1.145',
    netmask:'255.255.255.0',
    broadcast: '192.168.1.255',
    gateway: '192.168.1.1'    
}, function(err){

});
*/

/*
network.configureDHCP('eth0', { }, function(err){

});
*/

// network.interfaces(function(err, iface){console.log(iface);});
