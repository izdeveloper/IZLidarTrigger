// JavaScript File
var triggerq = require("../readertrigger/triggerQ");


var triggers = (function ()
{
    var me  = {};
    
    me.triggers = function (req, res)
    {
        console.log("Request triggers");
        res.json(triggerq.triggers);
        // res.send(triggerq.triggersJSON());
    }
    
    return me;
}());

module.exports = triggers;