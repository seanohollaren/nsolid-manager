'use strict';

/* ----------------------------------
This file will install all necessary dependencies

TODO (Alex): Checksum download files
TODO (Alex): put extracted files into versioned sub folders
TODO (Alex): Add Tests
TODO (Alex): DRY up code and move into modules
TODO (Alex): Provide more sanity checking of Filesystem changes
 -----------------------------------*/

const FileDownloader = require('./lib/file-downloader.js');
const binaryUrls = require('./binary-urls.json');
const os = require('os');
const fs = require('fs');
const ncp = require('ncp');
const targz = require('tar.gz');
const unzip = require('unzip');
const _ = require('lodash');
const utils = require('./lib/utils');

// Windows is not currently supported
const isWin = /^win/.test(process.platform);
if (isWin) {
  console.error('Windows Not Currently Supported');
  process.exit(1);
}

// 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
let platform = os.platform();
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
Test if Dependency Directory Exists
*/
const dependencyDir = `${__dirname}/dependencies`;
if (!fs.existsSync(dependencyDir)) {
  fs.mkdirSync(dependencyDir);
}

/*
Promise Workflow
*/
loadAllMetaData(binaryUrls).then(metaData => {
    //TODO (Alex): Perform some check for existing libraries
    return downloadAndExtractAll(metaData);
  }).then(result => {
    console.log('Done Downloading');
  })
  .catch(err => {
    console.error(err, err.stack);
  });


/* ***************************************************************
Functions to download and extract libraries
TODO (Alex): DRY this up. This is current broken into highly
redundant functions to make edge cases with each easier to deal with
**************************************************************** */
function downloadAndExtractAll(metaData) {

  const downloadQueue = [
    downloadHub(metaData['nsolid-hub']),
    downloadConsole(metaData['nsolid-console']),
    downloadNsolid(metaData.nsolid),
    downloadEtcd(metaData.etcd)
  ];

  return Promise.all(downloadQueue);

}

function downloadHub(metaData) {
  return new Promise((resolve, reject) => {
    const version = metaData.meta.version;
    const filename = utils.templateString(metaData.file, {
      version,
      platform
    });
    const url = `${metaData.dir}${version}/${filename}`;

    new FileDownloader({
        url,
        location: `${dependencyDir}/${filename}`
      })
      .on('progress', state => {})
      .on('error', reject)
      .on('done', file => {
        // untar file
        fs.createReadStream(file)
          .pipe(targz({}, {
            strip: 1
          }).createWriteStream(`${dependencyDir}/proxy`))
          .on('end', () => {
            resolve();
          });
      })
      .start();

  });
}

function downloadConsole(metaData) {
  return new Promise((resolve, reject) => {
    const version = metaData.meta.version;
    const filename = utils.templateString(metaData.file, {
      version,
      platform
    });
    const url = `${metaData.dir}${version}/${filename}`;

    new FileDownloader({
        url,
        location: `${dependencyDir}/${filename}`
      })
      .on('progress', state => {})
      .on('error', reject)
      .on('done', file => {
        // untar file
        fs.createReadStream(file)
          .pipe(targz({}, {
            strip: 1
          }).createWriteStream(`${dependencyDir}/console`))
          .on('end', () => {
            resolve();
          });

      })
      .start();
  });
}

function downloadNsolid(metaData) {
  return new Promise((resolve, reject) => {
    const version = metaData.meta.version;
    const filename = utils.templateString(metaData.file, {
      version,
      platform
    });
    const url = `${metaData.dir}${version}/${filename}`;

    new FileDownloader({
        url,
        location: `${dependencyDir}/${filename}`
      })
      .on('progress', state => {})
      .on('error', reject)
      .on('done', file => {
        // untar file
        fs.createReadStream(file)
          .pipe(targz({}, {
            strip: 1
          }).createWriteStream(`${dependencyDir}/nsolid`))
          .on('end', () => {
            resolve();
          });


      })
      .start();
  });
}

function downloadEtcd(metaData) {
  return new Promise((resolve, reject) => {

    const version = metaData.meta.tag_name;
    const filename = utils.templateString(metaData.file, {
      version,
      platform,
      extension: (platform === 'linux') ? '.tar.gz' : '.zip'
    });
    // without extension
    const rawfilename = utils.templateString(metaData.file, {
      version,
      platform,
      extension: ''
    });
    // find the relevant asset from a list of them
    const asset = _.find(metaData.meta.assets, {
      name: filename
    });

    if (!asset) {
      console.error('unable to find etcd version asset');
      process.exit(1);
    }

    const url = asset.browser_download_url;

    new FileDownloader({
        url,
        location: `${dependencyDir}/${filename}`
      })
      .on('progress', state => {})
      .on('error', reject)
      .on('done', file => {
        let outputStream;

        // we need to use unzip on darwin
        if (platform === 'linux') {
          outputStream = targz({}, {
            strip: 1
          }).createWriteStream(`${dependencyDir}/etcd`);
        }
        else {
          outputStream = unzip.Extract({ //eslint-disable-line
            path: `${dependencyDir}/etcd`
          });
        }


        // untar file
        fs.createReadStream(file)
          .pipe(outputStream)
          .on('close', streamCleanup);

        function streamCleanup() {
          console.log('Inside fs.createReadStream end block.');
          console.log(`Platform: ${platform}`);
          // if we are on mac we need to move the location of the
          // unzipped folder up one level. So we will just the NCP library
          if (platform === 'darwin') {
            console.log('Detected Darwin');
            console.log(`Copying From: ${dependencyDir}/etcd/${rawfilename}`);
            console.log(`To: ${dependencyDir}/etcd/`);
            ncp(
              `${dependencyDir}/etcd/${rawfilename}`,
              `${dependencyDir}/etcd/`,
              (err) => {
                if (err) return reject(err);

                // chmod file
                fs.chmodSync(`${dependencyDir}/etcd/etcd`, '0740');
                return resolve();
              });
          }
          else {
            resolve();
          }
        }

      })
      .start();
  });
}


/* ***************************************************************
Functions to load meta data
Version example: `v3.4.2`
TODO (Alex): DRY this up. This is current broken into highly
redundant functions to make edge cases with each easier to deal with
**************************************************************** */
function loadAllMetaData(metaData) {

  const metaQueue = [
    loadHubMetaData(),
    loadConsoleMetaData(),
    loadNsolidMetaData(),
    loadEtcdMetaData()
  ];

  return Promise.all(metaQueue).then(results => new Promise(resolve => {
    // map results to existing meta data object
    // TODO (Alex): Be more elegant than this
    const newObj = _.extend({}, metaData);
    newObj['nsolid-hub'].meta = results[0];
    newObj['nsolid-console'].meta = results[1];
    newObj.nsolid.meta = results[2];
    newObj.etcd.meta = results[3];
    return resolve(newObj);
  }));
}

function loadHubMetaData(version) {
  return new Promise((resolve, reject) => {
    utils.requestAsync(binaryUrls['nsolid-hub'].metaUrl).then(metaData => {
      if (version) {
        const vData = _.find(metaData, {
          version
        });
        if (vData) resolve(vData);
        return reject(new Error('Unable to find version data for Hub'));
      }

      return resolve(metaData[0]);

    }, reject);
  });
}

function loadConsoleMetaData(version) {
  return new Promise((resolve, reject) => {
    utils.requestAsync(binaryUrls['nsolid-console'].metaUrl).then(metaData => {
      if (version) {
        const vData = _.find(metaData, {
          version
        });
        if (vData) return resolve(vData);
        return reject(new Error('Unable to find version data for Console'));
      }
      return resolve(metaData[0]);
    }, reject);
  });
}

function loadNsolidMetaData(version) {
  return new Promise((resolve, reject) => {
    utils.requestAsync(binaryUrls.nsolid.metaUrl).then(metaData => {
      if (version) {
        const vData = _.find(metaData, {
          version
        });
        if (vData) return resolve(vData);
        return reject(new Error('Unable to find version data for the Nsolid Binary'));
      }
      return resolve(metaData[0]);
    }, reject);
  });
}

function loadEtcdMetaData(version) {
  return new Promise((resolve, reject) => {
    utils.requestAsync(binaryUrls.etcd.metaUrl).then(metaData => {
      if (version) {
        const vData = _.findWhere(metaData, {
          tag_name: version
        });
        if (vData) return resolve(vData);
        return reject(new Error('Unable to find version data for Etcd'));
      }
      return resolve(metaData[0]);
    }, reject);
  });
}
