var prefix = "results/";
var suffix = ".xml";
var xmlMimeType = "text/xml";

var formidable = require('formidable'), http = require('http'), util = require('util');
var fs = require('fs');

http.createServer(function(req, res) {
  if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
    // parse a file upload
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
      res.writeHead(200, {'content-type': 'text/html'});
      validateFile(fields, files);
      var linkback = "http://" + req.headers.host +"/" + prefix + files.upload.path.substr(5) + suffix;
      res.end('<a href="'+linkback+'">'+linkback+'</a>');
    });

    return;
  }

  if (req.url.match('/results') && req.method.toLowerCase() == 'get') {
    var pathname = req.url;
    pathname = pathname.substr(8);
    filename = "./"+prefix+pathname;
    fs.exists(filename, function(exists) {
      if(!exists) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write('404 Not Found\n');
        res.end();
        return;
      }
      res.writeHead(200, xmlMimeType);
      var fileStream = fs.createReadStream(filename);
      fileStream.pipe(res);
    });
  } else {
    // show a file upload form
    res.writeHead(200, {'content-type': 'text/html'});
    res.end(
      '<form action="/upload" enctype="multipart/form-data" method="post">'+
      '<input type="text" name="title"><br>'+
      '<input type="file" name="upload" multiple="multiple"><br>'+
      '<input type="submit" value="Upload">'+
      '</form>'
    );
  }
}).listen(8181);

function validateFile(fields, files) {
  var filename = files.upload.path;
  var toreplace = filename.substr(5);
  var replacewith = files.upload.name;
  var outfilename = "./" + prefix + toreplace + suffix;
  var pfresult = "";

  var exec = require('child_process').exec, child;
  child = exec('java -jar preflight-app.jar xml ' + filename, 
    function (error, stdout, stderr) {
      var result = stdout.toString();
      result = result.replace(toreplace, replacewith);  
      fs.writeFile(outfilename, result, function(err) {
        if(err) {
          console.log(err);
        } else {
          // file saved. could log.
          //console.log("The file was saved!");
        }
      }); 
      // No need to do ought with stderr
      if (error !== null) {
        console.log(error);
      }
    }
  );
}

