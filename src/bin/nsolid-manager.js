#!/usr/bin/env node

'use strict';

const argv = require('minimist')(process.argv.slice(2));
const spawn = require('child_process').spawn;
const path = require('path');

// Grab values from flags
// TODO: Add more flags to override default values
const params = {
  appName: argv.name || argv.n,
  appPath: argv.path || argv.p
};

validateParams(params, argv);

console.log(`\n  Launching app: ${params.appName}\n`);

setEnvironmentVars(params);

// Define strings to start up child processes
const etcdExec = 'etcd';
const etcdArgs = ['-name', 'nsolid_proxy', '-listen-client-urls', 'http://0.0.0.0:4001', '-advertise-client-urls', 'http://0.0.0.0:4001', '-initial-cluster-state', 'new'];

// TODO: Allow the location of the proxy files to be specified?
const proxyExec = 'node';
const proxyArgs = [path.resolve(__dirname, '../nsolid/proxy/proxy.js'), '--config', path.resolve(__dirname, '../nsolid/proxy/.nsolid-proxyrc')];

// TODO: Allow the location of the console files to be specified?
const consoleExec = 'node';
const consoleArgs = [path.resolve(__dirname, '../nsolid/console/bin/nsolid-console'), '--interval=1000'];

// Start up target app with nsolid
const appExec = 'nsolid';
const appArgs = [params.appPath];

// Array to hold all child processes
const children = [];

// Spawn child processes and add to children array
children.push(spawn(etcdExec, etcdArgs));
children.push(spawn(proxyExec, proxyArgs));
children.push(spawn(consoleExec, consoleArgs));
children.push(spawn(appExec, appArgs));

// Pipe output and err through current process
children.forEach(child => {
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
});

function validateParams(paramsObj, args) {
  // TODO: Look for missing or malformed args and bail early with an informative error message
  if (args.help || !(paramsObj.appName || paramsObj.appPath)) {
    printHelp();
    process.exit(0);
  }

  // If appName was missing or blank
  if (!paramsObj.appName || paramsObj.appName === true) {
    console.log(`\n  Missing app name.\n\n         Specify with the --name flag. \n\n  Exiting... \n`);
    process.exit(1);
  }

  // If appPath was missing or blank
  if (!paramsObj.appPath || paramsObj.appPath === true) {
    console.log(`\n  Missing path to the app you want to run with nsolid.\n\n         Specify with the --path flag. \n\n  Exiting... \n`);
    process.exit(1);
  }
}

// Set appropriate environment variables
function setEnvironmentVars(paramsObj) {
  // TODO: Allow these to be optionally overridden
  process.env.NSOLID_APPNAME = paramsObj.appName;
  process.env.NSOLID_HUB = 'localhost:4001';
  process.env.NSOLID_SOCKET = 1111;
}

function printHelp() {
  console.log(`\n N|Solid Manager

    Sets up the prerequisites for an N|Solid server and executes a target app using nsolid.

    Arguments:

      --name    Name of the app as you'd like it to appear in the N|Solid console
      --path    Path to the target app's entry point

    Example:

      node index --name myApp --path ../code/myApp/app.js \n`);
}
