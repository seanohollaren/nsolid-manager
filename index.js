'use strict';

const argv = require('minimist')(process.argv.slice(2));
const spawn = require('child_process').spawn;

// Grab values from flags
// TODO: Add more flags to override default values
const appName = argv.name;
const appPath = argv.path;

// set appropriate environment variables
process.env.NSOLID_APPNAME = appName;
// TODO: Allow these to be overridden by defaults
process.env.NSOLID_HUB = 'localhost:4001';
process.env.NSOLID_SOCKET = 1111;

// define strings to start up child processes
let etcdExec = `etcd`
let etcdArgs =  [`-name`, `nsolid_proxy`, `-listen-client-urls`, `http://0.0.0.0:4001`, `-advertise-client-urls`, `http://0.0.0.0:4001`, `-initial-cluster-state`, `new`];
let proxyExec = `nsolid nsolid/nsolid-proxy/proxy.js`;
let consoleExec = `node nsolid/nsolid-console/bin/nsolid-console --interval=1000`

let children = [];

// spawn child processes and add to children array
console.log(`Spawning etcd...`);
children.push(spawn(etcdExec, etcdArgs));
// console.log(`Spawning nsolid proxy...`);
// children.push(spawn(proxyExec));
// console.log(`Spawning nsolid console...`);
// children.push(spawn(consoleExec));

// pipe output and err through current process
children.forEach(child => {
  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
})
