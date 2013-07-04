var prefix = "results/";
var suffix = ".xml";
var xmlMimeType = "text/xml";
var port = 8181;
var preflightjar = "preflight-app-2.0.0-SNAPSHOT.jar";

var formidable = require('formidable'), http = require('http'), util = require('util');
var fs = require('fs');

fs.mkdir("./"+prefix, function(e) {});

http.createServer(function(req, res) {
  if (req.url == '/upload' && req.method.toLowerCase() == 'post') {

    // parse a file upload
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
      console.log("Incoming! [" + files.upload.name + "]");
      action = 'java -jar ' + preflightjar + ' xml ' + files.upload.path;
      validateFile(fields, files, action);
      action = 'fido/fido.py ' + files.upload.path + ' | fido/toxml.py';
      validateFile(fields, files, action);
      res.writeHead(200, {'content-type': 'text/html'});
      var filename = prefix+files.upload.path.substr(5)+'j'+ '.' + suffix;
      fs.exists(filename, function(exists) {
        var linkback = "http://" + req.headers.host +"/" + prefix + files.upload.path.substr(5) + 'j' + suffix;
        res.end('<a href="'+linkback+'">'+linkback+'</a>');
      });
    });
    return;
  }

  if (req.url.match('/results') && req.method.toLowerCase() == 'get') {
    var pathname = req.url;
    pathname = pathname.substr(9);
    filename = "./"+prefix+pathname;
    console.log("Result! [" + filename + "]");
    try {
      var fileStream = fs.createReadStream(filename);
    } catch (e) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write('404 Not Found\n');
        res.end();
        return;
   }
   res.writeHead(200, xmlMimeType);
   //res.write('<nodeserver>');
   fileStream.pipe(res);
   filename2 = filename.substr(0, filename.length - 5) + 'f' + suffix;
   console.log(filename2);
   try {
        var fileStream2 = fs.createReadStream(filename2);
   } catch (e) {
        return;
   }
   fileStream2.pipe(res);
    //res.write('</nodeserver>');
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
}).listen(port);

console.log("");
console.log("PDFBox Preflight Node.js Server Wrapper started on host:"+port);
console.log("Good luck!");
console.log("");

function validateFile(fields, files, action) {
  var filename = files.upload.path;
  var toreplace = filename.substr(5) + action.substr(0,1);
  var replacewith = files.upload.name;
  var outfilename = "./" + prefix + toreplace + suffix;
  var pfresult = "";

  var exec = require('child_process').exec, child;
  child = exec(action, 
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
 
