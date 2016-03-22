'use strict';

/* ----------------------------------
This file will install all necessary dependencies

TODO (Alex): Checksum download files
TODO (Alex): put extracted files into versioned sub folders
TODO (Alex): Add Tests
TODO (Alex): DRY up code and move into modules
TODO (Alex): Provide more sanity checking of Filesystem changes
 -----------------------------------*/

var FileDownloader = require('./lib/file-downloader.js');
var binaryUrls = require('./binary-urls.json');
var os = require('os');
var fs = require('fs');
var ncp = require('ncp');
var targz = require('tar.gz');
var unzip = require('unzip');
var _ = require('lodash');
var utils = require('./lib/utils');

// Windows is not currently supported
var isWin = /^win/.test(process.platform);
if (isWin) {
  console.error('Windows Not Currently Supported');
  process.exit(1);
}

// 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
var platform = os.platform();
// map platforms to 2
switch (platform) {
  case 'sunos':
  case 'freebsd':
    platform = 'linux';
    break;
  default:
    break;
}

/*
Promise Workflow
*/
loadAllMetaData(binaryUrls).then(function (metaData) {
  //TODO (Alex): Perform some check for existing libraries
  return downloadAndExtractAll(metaData);
}).then(function (result) {
  console.log('Done Downloading');
}).catch(function (err) {
  console.error(err, err.stack);
});

/* ***************************************************************
Functions to download and extract libraries
TODO (Alex): DRY this up. This is current broken into highly
redundant functions to make edge cases with each easier to deal with
**************************************************************** */
function downloadAndExtractAll(metaData) {

  var downloadQueue = [downloadHub(metaData['nsolid-hub']), downloadConsole(metaData['nsolid-console']), downloadNsolid(metaData.nsolid), downloadEtcd(metaData.etcd)];

  return Promise.all(downloadQueue);
}

function downloadHub(metaData) {
  return new Promise(function (resolve, reject) {
    var version = metaData.meta.version;
    var filename = utils.templateString(metaData.file, {
      version: version,
      platform: platform
    });
    var url = '' + metaData.dir + version + '/' + filename;

    new FileDownloader({
      url: url,
      location: __dirname + '/dependencies/' + filename
    }).on('progress', function (state) {}).on('error', reject).on('done', function (file) {
      // untar file
      fs.createReadStream(file).pipe(targz({}, {
        strip: 1
      }).createWriteStream(__dirname + '/dependencies/proxy')).on('end', function () {
        resolve();
      });
    }).start();
  });
}

function downloadConsole(metaData) {
  return new Promise(function (resolve, reject) {
    var version = metaData.meta.version;
    var filename = utils.templateString(metaData.file, {
      version: version,
      platform: platform
    });
    var url = '' + metaData.dir + version + '/' + filename;

    new FileDownloader({
      url: url,
      location: __dirname + '/dependencies/' + filename
    }).on('progress', function (state) {}).on('error', reject).on('done', function (file) {
      // untar file
      fs.createReadStream(file).pipe(targz({}, {
        strip: 1
      }).createWriteStream(__dirname + '/dependencies/console')).on('end', function () {
        resolve();
      });
    }).start();
  });
}

function downloadNsolid(metaData) {
  return new Promise(function (resolve, reject) {
    var version = metaData.meta.version;
    var filename = utils.templateString(metaData.file, {
      version: version,
      platform: platform
    });
    var url = '' + metaData.dir + version + '/' + filename;

    new FileDownloader({
      url: url,
      location: __dirname + '/dependencies/' + filename
    }).on('progress', function (state) {}).on('error', reject).on('done', function (file) {
      // untar file
      fs.createReadStream(file).pipe(targz({}, {
        strip: 1
      }).createWriteStream(__dirname + '/dependencies/nsolid')).on('end', function () {
        resolve();
      });
    }).start();
  });
}

function downloadEtcd(metaData) {
  return new Promise(function (resolve, reject) {

    var version = metaData.meta.tag_name;
    var filename = utils.templateString(metaData.file, {
      version: version,
      platform: platform,
      extension: platform === 'linux' ? '.tar.gz' : '.zip'
    });
    // without extension
    var rawfilename = utils.templateString(metaData.file, {
      version: version,
      platform: platform,
      extension: ''
    });
    // find the relevant asset from a list of them
    var asset = _.find(metaData.meta.assets, {
      name: filename
    });

    if (!asset) {
      console.error('unable to find etcd version asset');
      process.exit(1);
    }

    var url = asset.browser_download_url;

    new FileDownloader({
      url: url,
      location: __dirname + '/dependencies/' + filename
    }).on('progress', function (state) {}).on('error', reject).on('done', function (file) {
      var outputStream = void 0;

      // we need to use unzip on darwin
      if (platform === 'linux') {
        outputStream = targz({}, {
          strip: 1
        }).createWriteStream(__dirname + '/dependencies/etcd');
      } else {
        outputStream = unzip.Extract({ //eslint-disable-line
          path: __dirname + '/dependencies/etcd'
        });
      }

      // untar file
      fs.createReadStream(file).pipe(outputStream).on('end', function () {

        // if we are on mac we need to move the location of the
        // up one level. So we will just the NCP library
        if (platform === 'darwin') {
          ncp(__dirname + '/dependencies/etcd/' + rawfilename, __dirname + '/dependencies/etcd/', function (err) {
            if (err) return reject(err);
            return resolve();
          });
        } else {
          resolve();
        }
      });
    }).start();
  });
}

/* ***************************************************************
Functions to load meta data
Version example: `v3.4.2`
TODO (Alex): DRY this up. This is current broken into highly
redundant functions to make edge cases with each easier to deal with
**************************************************************** */
function loadAllMetaData(metaData) {

  var metaQueue = [loadHubMetaData(), loadConsoleMetaData(), loadNsolidMetaData(), loadEtcdMetaData()];

  return Promise.all(metaQueue).then(function (results) {
    return new Promise(function (resolve) {
      // map results to existing meta data object
      // TODO (Alex): Be more elegant than this
      var newObj = _.extend({}, metaData);
      newObj['nsolid-hub'].meta = results[0];
      newObj['nsolid-console'].meta = results[1];
      newObj.nsolid.meta = results[2];
      newObj.etcd.meta = results[3];
      return resolve(newObj);
    });
  });
}

function loadHubMetaData(version) {
  return new Promise(function (resolve, reject) {
    utils.requestAsync(binaryUrls['nsolid-hub'].metaUrl).then(function (metaData) {
      if (version) {
        var vData = _.find(metaData, {
          version: version
        });
        if (vData) resolve(vData);
        return reject(new Error('Unable to find version data for Hub'));
      }

      return resolve(metaData[0]);
    }, reject);
  });
}

function loadConsoleMetaData(version) {
  return new Promise(function (resolve, reject) {
    utils.requestAsync(binaryUrls['nsolid-console'].metaUrl).then(function (metaData) {
      if (version) {
        var vData = _.find(metaData, {
          version: version
        });
        if (vData) return resolve(vData);
        return reject(new Error('Unable to find version data for Console'));
      }
      return resolve(metaData[0]);
    }, reject);
  });
}

function loadNsolidMetaData(version) {
  return new Promise(function (resolve, reject) {
    utils.requestAsync(binaryUrls.nsolid.metaUrl).then(function (metaData) {
      if (version) {
        var vData = _.find(metaData, {
          version: version
        });
        if (vData) return resolve(vData);
        return reject(new Error('Unable to find version data for the Nsolid Binary'));
      }
      return resolve(metaData[0]);
    }, reject);
  });
}

function loadEtcdMetaData(version) {
  return new Promise(function (resolve, reject) {
    utils.requestAsync(binaryUrls.etcd.metaUrl).then(function (metaData) {
      if (version) {
        var vData = _.findWhere(metaData, {
          tag_name: version
        });
        if (vData) return resolve(vData);
        return reject(new Error('Unable to find version data for Etcd'));
      }
      return resolve(metaData[0]);
    }, reject);
  });
}