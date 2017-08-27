const exec = require('child_process').exec;

var wasDown = false;

var timeout = 1000;

var canStart = true;

restartNet();
 

function restartNet()
{
  
  if (canStart == true )
  {
    exec('cat /sys/class/net/eth0/operstate', function (error, stdout, stderr){
      if (error) {
        console.error("error="+ error);
        return;
      }
      if (stdout === "up\n")
      {
        if (wasDown == true)
        {
          canStart = false;
          exec("/etc/init.d/networking restart", function (error, stdout, stderr){console.log("network restarted"); canStart = true;});
          wasDown = false;
        }
        
        console.log("stdout= "+ stdout);
      }
      if (stdout === "down\n")
      {
        console.log("stdout= "+ stdout);
        wasDown = true;
      }
      
      console.log(stderr);
    });
  }
  console.log("timeout = "+timeout);
  setTimeout(restartNet, timeout);

}