// JavaScript File


var fs = require('fs');

var dl = (function ()
{
  var testFolder = './website/';
  var me = {};
  
  me.listDir = function(req, res) 
  {
    var str = '';
    fs.readdir(testFolder, function (err, files){
      console.log("ReadDir="+req.url);
      str = "<html><head><title>" + req.url + "</title>" +
                    "<style type=\"text/css\">a.a1{background-color:#ADD8E6;margin:0;padding:0;font-weight:bold;}a.a2{background-color:#87CEEB;margin:0;padding:0;font-weight:bold;}</style>" +
                    "</head><body><a href=\"http:" +req.header.host + "/dir" + "\">Directory Listing</a><br/>" +
                    "<h2>Files:</h2>";
      res.write(str);
      
      files.forEach( function(file)
      {
        var str = "<a href=\""+ "./website/" + file+ "\" class=\"a1\">" + file + "</a><br/>";
        res.write(str);
        // console.log(file);
      });
      res.end();
    });
  };
  
  me.getFile = function(req, res)
  {
    console.log("ReadFile="+req.url);
    // check if the file exists
    if (fs.existsSync("."+req.url) == false) 
    {
      res.send("<h2>Bad File Name</h2>");
      return;
    }
    // console.log("Request="+req.url);
    res.sendFile(req.url, {root: './'});
  };
  
  return me;
}());

module.exports = dl;