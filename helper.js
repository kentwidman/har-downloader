var fs = require("fs");
var url = require("url");
var path = require('path');
var http = require('http');
var https = require('https');
var Stream = require('stream').Transform;
var mkdirp = require('mkdirp');

var DS = '/';

module.exports.usage = function (){
	console.log('har_downloader <har_files> <output_dir>');
};

module.exports.checkDistfolder = function (output_dir){
	console.log('test:');
	if (fs.existsSync(output_dir)) {
		var output_stat;
		try {
			output_stat = fs.statSync(output_dir);
		} catch (e) {
			console.log(e);
		    return;
		}

	  if (output_stat.isDirectory()){
	  	var output_folder = fs.readdirSync(output_dir);
	  	var output_folder_final = [];

			//see if folder is empty.
	  	for (var i = 0; i < output_dir.length; i++){
	  		var filename = output_folder[i];

				//stop if folder is not empty.
	  		if (filename && filename !== '.' && filename !== '..' && filename !== '.DS_Store'){
					console.log('This folder isn\'t empty.');
					console.log(output_folder_final);
					return false;
	  		}
	  	}
      return true;

	  } else if (output_stat.isFile()) {
			console.log('Error: output_path is a file!');
			usage();
			return false;
	  }
	} else {
		//create folder
		mkdirp.sync(output_dir);
    return true;
	}
};

module.exports.openHarFile = function(har_files) {
  var har_text = fs.readFileSync(har_files);
  var har = JSON.parse(har_text);
  return har;
};

module.exports.processHar = function(har, output_dir) {
  console.log(har.log.entries.length);

  var domain;

  har.log.entries.forEach(function(entry) {
  	var entryUrl = entry.request.url;
  	var entryUrlParts = url.parse(entryUrl);

  	//console.log(entryUrlParts);

    //assume first request will have correct hostname.
    if (!domain){
      domain = entryUrlParts.hostname;
    }

    //ignore some domains
  	if (
  		entryUrlParts.hostname === 'www.google-analytics.com' ||
  		entryUrlParts.hostname === 'static.ak.facebook.com' ||
  		entryUrlParts.hostname === 's-static.ak.facebook.com'){
      return;
    }


    var entryFilepath,
        entryDirpath;

    //add domain to outside urls
    if (entryUrlParts.hostname === domain){
      entryFilepath = output_dir + entryUrlParts.pathname;
    } else {
      entryFilepath = output_dir + DS + entryUrlParts.hostname + entryUrlParts.pathname;
    }
    entryDirpath = entryFilepath.substr(0, entryFilepath.lastIndexOf('/'));

    // console.log(entryFilepath);
    // console.log(entryDirpath);
    // return;

    try {
      mkdirp.sync(entryDirpath);
    } catch (e) {
			console.log(e);
      return;
    }

		if (entryUrlParts.pathname === '/'){
			entryFilepath = output_dir + DS + 'index.html';
		} else if (entryUrlParts.pathname.substr(entryUrlParts.pathname.length - 1) === '/') {
			entryFilepath = output_dir + DS + 'index.html';
		}
    var data = new Stream();

		try {
      console.log('Output directory:' + entryFilepath);
			//var file = fs.openSync(entryFilepath, 'w');
			var request = null;
			if (entryUrlParts.protocol === 'https:'){
				request = https.get(entryUrl, function(response) {
          var data = new Stream();

          console.log(entryUrl);
          // console.log('statusCode:', response.statusCode);
          // console.log('headers:', response.headers);
          response.on('data', function(chunk) {
            data.push(chunk);
          });

          request.on('close', function(){
            console.log('writing to ' + entryFilepath);
            try {
              fs.writeFileSync(entryFilepath, data.read());
            } catch (e) {
        			console.log(e);
        		}
          });
				});
			} else {
				request = http.get(entryUrl, function(response) {
          var data = new Stream();

          console.log(entryUrl);
          // console.log('statusCode:', response.statusCode);
          // console.log('headers:', response.headers);
          response.on('data', function(chunk) {
            data.push(chunk);
          });

          request.on('close', function(){
            console.log('writing to ' + entryFilepath);
            try {
              fs.writeFileSync(entryFilepath, data.read());
            } catch (e) {
        			console.log(e);
        		}
          });
				});
			}
		} catch (e) {
			console.log(e);
		}
  });
};
