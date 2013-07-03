preflight-server
================
## Intro
This is a simple and somewhat shonky wrapper for the PDFBox Preflight PDF Validator tool. Seems to work OK. You can http POST a file to it
(using field "upload") and it'll save that file to `/tmp` and then execute Preflight on it. It returns a URL of where it thinks it'll put the
results. This URL will return a `404` while the validator is running and return the XML output once done.

## Install
### Install Node.js
You'll need a 0.10 version of node.js and can either download and build it yourself or use your package manager or whatever snazzy way
is available to Windows users. I had trouble on Ubuntu 12.04.2 which is still on an older version but luckily there is a PPA:

```
https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager#ubuntu-mint
```

```
sudo apt-get update
sudo apt-get install python-software-properties python g++ make
sudo add-apt-repository ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install nodejs
```

### Clone this repo
Nuff said.

### Install formidable module
From the repository root directory run:

```
npm install formidable@latest
```

### Get Preflight
You can get a pre-built binary here:

Alternately you can build it yourself. The stable 1.8 release of PDFBox does not include XML output options, so you'll need to build the latest source:

```
http://pdfbox.apache.org/downloads.html#scm
```

Build is pretty easy - svn checkout then maven install clean. Then you'll find the app in preflight-app/target as a self-contained jar.

### Save Preflight
The script is configured to use a jar called:

```
preflight-app-2.0.0-SNAPSHOT.jar
```

and you need to save that file to the repository root too.

## Rock and Roll
Tickle this creature with:

```
node pffmsrv.js
```

There is very rudimentary logging to the console when requests arrive.

## Warnings
node.js doesn't do anything snazzy with load and preflight is executed in its own JVM each time. This is slow and if you throw a zillion files
at it is very very likely to do Bad Things. My m/c locked up at about 30 processes, so you using this programmatically you might be wise
to throttle the requests. There isn't any real queuing or ought like that going on.

## ToDo
Nicer handling of the `404` - for example "not done yet".

Better error handling - an exception in node is kinda like turning off the record player at a party and scratching the record in the process.

Re-implement the whole thing in a Java container.
