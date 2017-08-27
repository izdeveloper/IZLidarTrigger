// JavaScript File
var fs = require('fs')
fs.readFile('/etc/network/interfaces', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  var lines = data.split(/\r?\n/);
  for (var i=0; i < lines.length; i++)
  {
    // console.log(lines[i]);
    if (lines[i] === "auto eth0")
    {
      lines[i+2] = "address 192.168.1.145";
      lines[i+3] = "netmask 255.255.255.0";
      lines[i+4] = "gateway 192.168.1.1";
      break;
    }
  }
  var wStream = fs.createWriteStream('/etc/network/interfaces', {'flags': 'w'});
  // use {'flags': 'a'} to append and {'flags': 'w'} to erase and write a new file
  for( var i=0; i < lines.length; i++)
  {
    wStream.write(lines[i]+"\n");
  }
  wStream.end();
  
  require('child_process').exec('sudo /sbin/shutdown -r now', function (msg) { console.log(msg) });
});

