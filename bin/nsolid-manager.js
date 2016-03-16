#!/usr/bin/env node


'use strict';

var argv = require('minimist')(process.argv.slice(2));
var spawn = require('child_process').spawn;

// Grab values from flags
// TODO: Add more flags to override default values
var appName = argv.name || argv.n;
var appPath = argv.path || argv.p;

// TODO: Look for missing or malformed args and bail early with an informative error message
if (argv.help) {
  printHelp();
  process.exit(0);
}

if (!appName) {
  console.log('\n  Missing app name.\n                   Specify with the --name flag. \n\n  Exiting... \n');
  process.exit(1);
}

if (!appPath) {
  console.log('\n  Missing path to the app you want to run with nsolid.\n                   Specify with the --path flag. \n\n  Exiting... \n');
  process.exit(1);
}

console.log('\n  Launching app: ' + appName);

// Set appropriate environment variables
process.env.NSOLID_APPNAME = appName;
// TODO: Allow these to be optionally overridden
process.env.NSOLID_HUB = 'localhost:4001';
process.env.NSOLID_SOCKET = 1111;

// Define strings to start up child processes
var etcdExec = 'etcd';
var etcdArgs = ['-name', 'nsolid_proxy', '-listen-client-urls', 'http://0.0.0.0:4001', '-advertise-client-urls', 'http://0.0.0.0:4001', '-initial-cluster-state', 'new'];

// TODO: Allow the location of the proxy files to be specified?
var proxyExec = 'node';
var proxyArgs = ['nsolid/proxy/proxy.js'];

// TODO: Allow the location of the console files to be specified?
var consoleExec = 'node';
var consoleArgs = ['nsolid/console/bin/nsolid-console', '--interval=1000'];

// Start up target app with nsolid
var appExec = 'nsolid';
var appArgs = [appPath];

// Array to hold all child processes
var children = [];

// Spawn child processes and add to children array
children.push(spawn(etcdExec, etcdArgs));
children.push(spawn(proxyExec, proxyArgs));
children.push(spawn(consoleExec, consoleArgs));
children.push(spawn(appExec, appArgs));

// Pipe output and err through current process
children.forEach(function (child) {
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
});

function printHelp() {
  console.log('\n N|Solid Manager\n\n    Sets up the prerequisites for an N|Solid server and executes a target app using nsolid.\n\n    Arguments:\n\n      --name    Name of the app as you\'d like it to appear in the N|Solid console\n      --path    Path to the target app\'s entry point\n\n    Example:\n\n      node index --name myApp --path ../code/myApp/app.js \n');
}