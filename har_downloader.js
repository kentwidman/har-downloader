#!/usr/bin/env node

var fs = require("fs");
var path = require('path');

//var express = require('express');
//var contentDisposition = require('content-disposition');
var pkg = require( path.join(__dirname, 'package.json') );
var program = require('commander');
var helper = require('./helper');


// Parse command line options
program
    .version(pkg.version)
    .usage('<har_files> <output_dir>')
    .parse(process.argv);

if (program.args.length !== 2){
	console.log('invalid arguments.');
	helper.usage();
	return;
}

var har_files = program.args[0],
	output_dir = program.args[1];

//Remove trailing slash.
while (output_dir.length >= 1 && output_dir.charAt(output_dir.length - 1) === '/'){
	output_dir = output_dir.substring(0, output_dir.length - 1);
}

console.log(har_files);
console.log(output_dir);

if (!helper.checkDistfolder(output_dir)){
	return;
}

//open har file
var har = helper.openHarFile(har_files);

//let only try 3 item.
// har.log.entries = har.log.entries.slice(0, 50);

//Go threw each entry in har file.
helper.processHar(har, output_dir);

// // Scan the directory in which the script was called. It will
// // add the 'files/' prefix to all files and folders, so that
// // download links point to our /files route
// var tree = scan('.', 'files');


// // Ceate a new express app
// var app = express();

// // Serve static files from the frontend folder
// app.use('/', express.static(path.join(__dirname, 'frontend')));

// // Serve files from the current directory under the /files route
// app.use('/files', express.static(process.cwd(), {
//     index: false,
//     setHeaders: function(res, path){

//         // Set header to force files to download
//         res.setHeader('Content-Disposition', contentDisposition(path))

//     }
// }));

// // This endpoint is requested by our frontend JS
// app.get('/scan', function(req,res){
//     res.send(tree);
// });


// // Everything is setup. Listen on the port.
// app.listen(port);

// console.log('Cute files is running on port ' + port);
