'use strict';
require('babel-polyfill');

const FileDownloader = require('./lib/file-downloader.js');
const binaryUrls = require('./binary-urls.json');
const request = require('request');
const os = require('os');
const utils = require('./utils');

// Windows is not currently supported
const isWin = /^win/.test(process.platform);
if (isWin) {
  throw new Error('Windows Not Currently Supported');
}

// 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
const platform = os.platform();


// (async function main() {
//   //load all meta data
//   let metaData = binaryUrls.map(async function(meta) {
//     meta.resource = await utils.requestAsync(meta.metaUrl);
//     return meta;
//   });
//   console.log(metaData);
// })();
