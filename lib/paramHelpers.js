'use strict';

var path = require('path');
var _ = require('lodash');

// Perform any required param validation
function validateParams(paramsObj) {

  // TODO (Sean): Look for missing or malformed args and bail early with an informative error message
  // If they specifically requested help or failed to provide any arguments
  if (paramsObj.helpRequested || !(paramsObj.appName || paramsObj.appPath)) {
    printHelp();
    process.exit(0);
  }

  // If appName was missing or blank
  if (!paramsObj.appName || paramsObj.appName === true) {
    console.log('\n  Missing app name.\n\n  Specify with the --name flag. \n\n  Exiting... \n');
    process.exit(1);
  }

  // If appPath was missing or blank
  if (!paramsObj.appPath || paramsObj.appPath === true) {
    console.log('\n  Missing path to the app you want to run with nsolid.\n\n  Specify with "nsm [appName]" or with the --path flag. \n\n  Exiting... \n');
    process.exit(1);
  }
}

// Perform any required pre-processing of params
function processParams(args) {

  // First try the flags
  var appPath = args.path || args.p;
  var appName = args.name || args.n;

  // Determine whether they asked for help
  var helpRequested = args.help || /help/i.test(args._[0]);

  // If --path wasn't supplied, assume they specified the file earlier in the command
  if (!appPath) {
    appPath = args._[0];
  }

  // If we weren't given a readable name, fall back to app name
  if (!appName && appPath) {
    appName = _.last(appPath.split(path.sep));
  }

  return {
    appName: appName,
    appPath: appPath,
    helpRequested: helpRequested
  };
}

function printHelp() {
  console.log('\n N|Solid Manager\n\n    Sets up the prerequisites for an N|Solid server and executes a target app using nsolid.\n\n    Usage:\n\n      nsm [script] [--name <friendlyName>] [--path <script>]\n\n    Arguments:\n\n      --name    Optional custom app name as you\'d like it to appear in the N|Solid console (alternatively -n)\n      --path    Alternative way of supplying a target script (alternatively -p)\n\n    Examples:\n\n      nsm app.js --name myApp\n\n      nsm --name myApp --path app.js \n');
}

module.exports = {
  validateParams: validateParams,
  processParams: processParams,
  printHelp: printHelp
};