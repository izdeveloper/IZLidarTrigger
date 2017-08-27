// JavaScript File
var formidable = require('formidable');
var path = require('path');
var fs = require('fs');

var app;

    var page = '<html><header><title>Upload Assembly File</title></header><body><h2>Please fill in the file-upload form below</h2>\
		                    <form method="POST" enctype="multipart/form-data" action="upload">File to upload: <input type="file" name="upfile">\
		                     <br>\
		                      <br>\
		                      <input type="submit" value="Press to upload the file"> \
  		                </form>\
	                  </body>\
                    </html>';

module.exports = {
    
    
    init: function(application)
    {
        app = application;
    },
    
    getUpload: function(req, res)
    {
        res.send(page);
    },
    
    postUpload: function(req, res)
    {
          // create an incoming form object
          var form = new formidable.IncomingForm();
        
          // specify that we want to allow the user to upload multiple files in a single request
          form.multiples = true;
        
          // store all uploads in the /uploads directory
          form.uploadDir = path.join(__dirname, '../');
        
          // every time a file has been uploaded successfully,
          // rename it to it's orignal name
          form.on('file', function(field, file) {
            fs.rename(file.path, path.join(form.uploadDir, file.name));
          });
        
          // log any errors that occur
          form.on('error', function(err) {
            console.log('An error has occured: \n' + err);
          });
        
          // once all the files have been uploaded, send a response to the client
          form.on('end', function() {
            // res.sendStatus(200);
            res.send(page);
            // res.end('success');
          });
        
          // parse the incoming request containing the form data
          form.parse(req);
    }
    
};