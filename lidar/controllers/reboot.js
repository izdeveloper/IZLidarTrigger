// JavaScript File

var rb = (function ()
{
    var me = {};
    
    me.Reboot = function()
    {
        console.log("Request reboot");
        // REBOOT the system
        // require('child_process').exec('sudo /sbin/shutdown -r now', function (msg) { console.log(msg) }); reboot -p
        require('child_process').exec('sudo reboot -f', function (msg) { console.log(msg) }); 
    }
    
    return me;
}());

module.exports=rb;