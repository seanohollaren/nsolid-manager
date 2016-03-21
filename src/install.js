'use strict';

const FileDownloader = require('./lib/file-downloader.js');
const os = require('os');


// Windows is not currently supported
const isWin = /^win/.test(process.platform);
if (isWin) {
  throw new Error('Windows Not Currently Supported');
}

// 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
const platform = os.platform();
