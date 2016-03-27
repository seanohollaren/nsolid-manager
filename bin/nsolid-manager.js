#!/usr/bin/env node


'use strict';

var argv = require('minimist')(process.argv.slice(2));
var spawn = require('child_process').spawn;
var path = require('path');
var extend = require('extend');
var paramHelpers = require('../lib/paramHelpers');

// Grab values from flags
// TODO (Sean): Add more flags to override default values
var params = paramHelpers.processParams(argv);

// Validate params and react accordingly
paramHelpers.validateParams(params, argv);

console.log('\n  Launching app: ' + params.appName + '\n');

var nsolidBinary = path.resolve(__dirname, '../dependencies/nsolid/bin/nsolid');
var etcd = path.resolve(__dirname, '../dependencies/etcd/etcd');

// Define strings to start up child processes
var etcdExec = etcd;
var etcdArgs = ['-name', 'nsolid_proxy', '-listen-client-urls', 'http://0.0.0.0:4001', '-advertise-client-urls', 'http://0.0.0.0:4001', '-initial-cluster-state', 'new', '-data-dir', path.resolve(__dirname, '../dependencies/etcd/')];

// TODO: Allow the location of the proxy files to be specified?
var proxyExec = nsolidBinary;
var proxyArgs = [path.resolve(__dirname, '../dependencies/nsolid-hub/proxy.js'), '--config', path.resolve(__dirname, '../dependencies/nsolid-hub/.nsolid-proxyrc')];

// TODO: Allow the location of the console files to be specified?
var consoleExec = nsolidBinary;
var consoleArgs = [path.resolve(__dirname, '../dependencies/nsolid-console/bin/nsolid-console'), '--interval=1000'];

// Start up target app with nsolid
var appExec = nsolidBinary;
var appArgs = [params.appPath];
var appEnvVars = getEnvironmentVars(params);

// Array to hold all child processes
var children = [];

// Spawn child processes and add to children array
children.push(spawn(etcdExec, etcdArgs));
children.push(spawn(proxyExec, proxyArgs));
children.push(spawn(consoleExec, consoleArgs, {
  // provide CWD to solve unknown babel error
  cwd: path.resolve(__dirname, '..'),
  env: {
    NODE_ENV: 'production'
  }
}));
children.push(spawn(appExec, appArgs, appEnvVars));

// Pipe output and err through current process
children.forEach(function (child) {
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
});

// Return an object containing appropriate environment variables
function getEnvironmentVars(paramsObj) {

  // TODO: Allow these to be optionally overridden
  // Pass back existing environment variables with ours added
  return {
    env: extend({}, process.env, {
      NSOLID_APPNAME: paramsObj.appName,
      NSOLID_HUB: 'localhost:4001',
      NSOLID_SOCKET: 1111
    })
  };
}