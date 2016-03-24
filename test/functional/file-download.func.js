'use strict';

const FileDownloader = require('../../lib/file-downloader');
const path = require('path');
const fs = require('fs');
const expect = require('chai').expect;
const testDownloadDirectory = path.resolve(__dirname, '../ignore');

/*
This currently taking a bit long to run.
We should have smaller test files we can use.
*/



describe('FileDownloader Works', function () {

  before(function (done) {

    // Make sure test download directory exists (and create it if it doesn't)
    if (!fs.existsSync(testDownloadDirectory)) {
      fs.mkdirSync(testDownloadDirectory);
    }

    done();

  });

  it('Should Work Without A Checksum', function (done) {
    this.timeout(60000);
    const location = path.resolve(testDownloadDirectory, 'nsolid-proxy-v3.4.2.tar.gz');


    /*
    Test Without Checksum
    */
    let testDownloader = new FileDownloader({
        url: 'https://nsolid-download.nodesource.com/download/nsolid-proxy/release/v3.4.2/nsolid-proxy-v3.4.2.tar.gz',
        location
      })
      .on('progress', (stat) => {
        expect(stat).to.be.an('object');
        expect(stat.time).to.be.an('object');
      })
      .on('done', (loc) => {
        expect(loc).to.equal(location);
        done();
      })
      .start();

  });

  it('Should Work With A Checksum', function (done) {
    this.timeout(60000);
    const location = path.resolve(testDownloadDirectory, 'nsolid-proxy-v3.4.2.tar.gz');


    /*
    Test Without Checksum
    */
    let testDownloader = new FileDownloader({
        url: 'https://nsolid-download.nodesource.com/download/nsolid-proxy/release/v3.4.2/nsolid-proxy-v3.4.2.tar.gz',
        location,
        checksum: '615a24727846612c87c2240b603d09d0eafc1f5100e5f28ce20a3121ca1b719d'
      })
      .on('progress', (stat) => {
        expect(stat).to.be.an('object');
      })
      .on('done', (loc) => {
        expect(loc).to.equal(location);
        done();
      })
      .on('error', (error) => {
        expect(error).to.equal(undefined);
      })
      .start();

  });

});
