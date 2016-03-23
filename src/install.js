'use strict';

/* ----------------------------------
This file will install all necessary dependencies

TODO (Alex): Checksum download files
TODO (Alex): put extracted files into versioned sub folders
TODO (Alex): Add Tests
TODO (Alex): Provide more sanity checking of Filesystem changes
 -----------------------------------*/

/*
Until this bug is fixed: https://github.com/eslint/eslint/issues/1801
We will not be enforcing indentation in eslint
*/
/* eslint indent: [0] */


const FileDownloader = require('./lib/file-downloader.js');
const binaryUrls = require('./binary-urls.json');
const os = require('os');
const fs = require('fs');
const ncp = require('ncp');
const debug = require('debug')('install');
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
debug('Raw Platform %s', platform);
// map platforms to 2
switch (platform) {
  case 'sunos':
  case 'freebsd':
    platform = 'linux';
    break;
  default:
    break;
}
debug('Mapped Platform %s', platform);

/*
Test if Dependency Directory Exists
*/
const dependencyDir = `${__dirname}/dependencies`;
if (!fs.existsSync(dependencyDir)) {
  debug('Creating Dependency Directory');
  fs.mkdirSync(dependencyDir);
}
else {
  debug('Dependency Directory Already Exists');
}

/*
Promise Workflow
*/
debug('Being Loading Package Metadata');
loadAllMetaData(binaryUrls).then(metaData => {
    debug('Finish loading all meta data about 3rd party packages');
    // TODO (Alex): Perform some check for existing libraries
    return downloadAndExtractAll(metaData);
  }).then(result => {
    console.log('Done Loading Dependencies %s', result);
  })
  .catch(err => {
    console.error(err, err.stack);
  });


/* ***************************************************************
Functions to download and extract libraries
**************************************************************** */
function downloadAndExtractAll(metaData) {
  debug('Beginning download of all packages');
  const downloadQueue = [
    downloadNsolidPackage('nsolid-hub', metaData),
    downloadNsolidPackage('nsolid-console', metaData),
    downloadNsolidPackage('nsolid', metaData),
    downloadEtcd(metaData.etcd)
  ];
  return Promise.all(downloadQueue);
}

// Universal function for downloading and extracting
// a Nsolid package (hub, console, nsolid)
function downloadNsolidPackage(name, allMetaData) {
  return new Promise((resolve, reject) => {
    const metaData = allMetaData[name];
    const version = metaData.meta.version;
    const filename = utils.templateString(metaData.file, {
      version,
      platform
    });
    const url = `${metaData.dir}${version}/${filename}`;
    debug('Making request for %s', url);

    new FileDownloader({
        url,
        location: `${dependencyDir}/${filename}`
      })
      .on('progress', state => {
        debug('Download Progress for %s: %s', name, state.size.transferred);
      })
      .on('error', reject)
      .on('done', file => {
        debug('File download completed for %s. Starting extract.', name);

        // untar file
        fs.createReadStream(file)
          .pipe(targz({}, {
            strip: 1
          }).createWriteStream(`${dependencyDir}/${name}`))
          .on('end', () => {
            debug('Extract Complete for %s', filename);
            resolve();
          });

      })
      .start();
  });
}

// Download and extract ETCD
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
    debug('Making request for %s. Filename: %s', url, filename);

    new FileDownloader({
        url,
        location: `${dependencyDir}/${filename}`
      })
      .on('progress', state => {
        debug('Download Progress for %s: %s', 'etcd', state.size.transferred);
      })
      .on('error', reject)
      .on('done', file => {
        debug('File download completed for etcd. Starting extract.');

        let outputStream;

        // we need to use unzip on darwin
        if (platform === 'linux') {
          debug('Linux detected. Using targz for etcd extract');
          outputStream = targz({}, {
            strip: 1
          }).createWriteStream(`${dependencyDir}/etcd`);
        }
        else {
          debug('Mac detected. Using unzip for etcd extract');
          outputStream = unzip.Extract({ //eslint-disable-line
            path: `${dependencyDir}/etcd`
          });
        }


        // untar file
        fs.createReadStream(file)
          .pipe(outputStream)
          .on('close', streamCleanup);

        function streamCleanup() {
          debug('Inside fs.createReadStream end block.');
          debug(`Platform: ${platform}`);
          // if we are on mac we need to move the location of the
          // unzipped folder up one level. So we will just the NCP library
          if (platform === 'darwin') {
            debug('Detected Mac');
            debug(`Copying From: ${dependencyDir}/etcd/${rawfilename}`);
            debug(`To: ${dependencyDir}/etcd/`);
            ncp(
              `${dependencyDir}/etcd/${rawfilename}`,
              `${dependencyDir}/etcd/`,
              (err) => {
                if (err) return reject(err);

                // chmod file
                debug('Chmodding etcd file');
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
    loadNsolidMetaData('nsolid-hub'),
    loadNsolidMetaData('nsolid-console'),
    loadNsolidMetaData('nsolid'),
    loadEtcdMetaData()
  ];

  return Promise.all(metaQueue).then(results => new Promise(resolve => {
    debug('Mapping Meta data response back onto original metadata object');
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

// Universal function for returning Nsolid meta data
function loadNsolidMetaData(name, version) {
  return new Promise((resolve, reject) => {
    utils.requestAsync(binaryUrls[name].metaUrl).then(metaData => {
      debug('Received meta data response for %s', name);
      // find specific version from meta data
      if (version) {
        debug('Searching for version %s for %s', version, name);
        const vData = _.find(metaData, {
          version
        });
        if (vData) resolve(vData);
        return reject(new Error(`Unable to find version data for ${name}`));
      }
      debug('Returning newest version for %s', name);
      // return newest version
      return resolve(metaData[0]);

    }, reject);
  });
}

// load etc release data from github
function loadEtcdMetaData(version) {
  return new Promise((resolve, reject) => {
    utils.requestAsync(binaryUrls.etcd.metaUrl).then(metaData => {
      debug('Received meta data response for etcd');
      if (version) {
        debug('Searching for version %s for %s', version, 'etcd');
        const vData = _.findWhere(metaData, {
          tag_name: version
        });
        if (vData) return resolve(vData);
        return reject(new Error('Unable to find version data for Etcd'));
      }
      debug('Returning newest version for etcd');
      return resolve(metaData[0]);
    }, reject);
  });
}
