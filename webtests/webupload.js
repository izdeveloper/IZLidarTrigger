// JavaScript File
// https://coligo.io/building-ajax-file-uploader-with-node/
var express = require('/usr/local/lib/node_modules/bonescript/node_modules/express');
var app = express();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');

// app.use(express.static(path.join(__dirname, 'public')));

   var page = '<html><header><title>Upload Assembly File</title></header><body><h2>Please fill in the file-upload form below</h2>\
		                    <form method="POST" enctype="multipart/form-data" action="upload">File to upload: <input type="file" name="upfile">\
		                     <br>\
		                      <br>\
		                      <input type="submit" value="Press to upload the file"> \
  		                </form>\
	                  </body>\
                    </html>';
                    

app.get('/upload', function(req, res){

  res.send(page);
});

app.post('/upload', function(req, res){

  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '/uploads');

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

});

var server = app.listen(5555, function(){
  console.log('Server listening on port 5555');
});