'use strict';

require('babel-polyfill');

var FileDownloader = require('./lib/file-downloader.js');
var binaryUrls = require('./binary-urls.json');
var request = require('request');
var os = require('os');
var utils = require('./utils');

// Windows is not currently supported
var isWin = /^win/.test(process.platform);
if (isWin) {
  throw new Error('Windows Not Currently Supported');
}

// 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
var platform = os.platform();

// (async function main() {
//   //load all meta data
//   let metaData = binaryUrls.map(async function(meta) {
//     meta.resource = await utils.requestAsync(meta.metaUrl);
//     return meta;
//   });
//   console.log(metaData);
// })();