'use strict';
var spawn = require('child_process').spawn;

//CLI PASSTHROUGH
var cli = spawn(__dirname + '/bin/nsolid-manager.js', process.argv);
cli.stdout.pipe(process.stdout);
cli.stderr.pipe(process.stderr);
