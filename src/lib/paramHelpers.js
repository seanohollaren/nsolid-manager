'use strict';

const path = require('path');
const _ = require('lodash');

// Perform any required param validation
function validateParams(paramsObj) {

  console.log('\nValidating params object');
  console.dir(paramsObj);

  // TODO (Sean): Look for missing or malformed args and bail early with an informative error message
  // If they specifically requested help or failed to provide any arguments
  if (paramsObj.helpRequested || !(paramsObj.appName || paramsObj.appPath)) {
    printHelp();
    process.exit(0);
  }

  // If appName was missing or blank
  if (!paramsObj.appName || paramsObj.appName === true) {
    console.log(`\n  Missing app name.\n\n  Specify with the --name flag. \n\n  Exiting... \n`);
    process.exit(1);
  }

  // If appPath was missing or blank
  if (!paramsObj.appPath || paramsObj.appPath === true) {
    console.log(`\n  Missing path to the app you want to run with nsolid.\n\n  Specify with "nsm [appName]" or with the --path flag. \n\n  Exiting... \n`);
    process.exit(1);
  }

}

// Perform any required pre-processing of params
function processParams(args) {

  // First try the flags
  let appPath = args.path || args.p;
  let appName = args.name || args.n;

  // Determine whether they asked for help
  const helpRequested = (args.help || /help/i.test(args._[0]));

  // If --path wasn't supplied, assume they specified the file earlier in the command
  if (!appPath) {
    appPath = args._[0];
  }

  // If we weren't given a readable name, fall back to app name
  if (!appName && appPath) {
    appName = _.last(appPath.split(path.sep));
  }

  return {
    appName,
    appPath,
    helpRequested
  };

}

function printHelp() {
  console.log(`\n N|Solid Manager

    Sets up the prerequisites for an N|Solid server and executes a target app using nsolid.

    Usage:

      nsm [script] [--name <friendlyName>] [--path <script>]

    Arguments:

      --name    Optional custom app name as you'd like it to appear in the N|Solid console (alternatively -n)
      --path    Alternative way of supplying a target script (alternatively -p)

    Examples:

      nsm app.js --name myApp

      nsm --name myApp --path app.js \n`);
}

module.exports = {
  validateParams,
  processParams,
  printHelp
};
