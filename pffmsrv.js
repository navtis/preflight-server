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
      validateFile(fields, files, action, 'j');
      action = 'fido/fido.py ' + files.upload.path + ' | fido/toxml.py';
      validateFile(fields, files, action, 'f');
      var filename = prefix+files.upload.path.substr(5) + suffix;
      var filename1 = prefix+files.upload.path.substr(5)+'j'+ suffix;
      var filename2 = prefix+files.upload.path.substr(5)+'f'+ suffix;
      // need to wait for the two execs to finish here
      action = 'xsltproc --stringparam filename2 "' + filename2 + '" merge.xsl ./'+ filename1;
      validateFile(fields, files, action, '');

      res.writeHead(200, {'content-type': 'text/html'});
      fs.exists(filename, function(exists) {
        var linkback = "http://" + req.headers.host +"/" + prefix + files.upload.path.substr(5) + suffix;
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
   fileStream.pipe(res);
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

function validateFile(fields, files, action, postfix) {
  var filename = files.upload.path;
  var toreplace = filename.substr(5) + postfix;
  var replacewith = files.upload.name;
  var outfilename = "./" + prefix + toreplace + suffix;
  var pfresult = "";

  var exec = require('child_process').exec, child;
  console.log(action);
  child = exec(action, 
    function (error, stdout, stderr) {
      var result = stdout.toString();
      result = result.replace(toreplace, replacewith);  
      fs.writeFile(outfilename, result, function(err) {
        if(err) {
          console.log(err);
        } else {
          // file saved. could log.
          console.log("The file was saved! " + outfilename);
        }
      }); 
      // No need to do ought with stderr
      if (error !== null) {
        console.log(error);
      }
    }
  );
}
 
