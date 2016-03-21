'use strict';
const checksum = require('checksum');
const progress = require('request-progress');
const fs = require('fs');
const request = require('request');
const EventEmitter = require('events').EventEmitter;


/*
Download files to a location and validate checksum
Accepts: checksum, location, url
Emits: progress, error, done
*/
class FileDownloader extends EventEmitter {
  constructor(opts) {
    if (!opts || typeof opts !== 'object') throw new Error('The File Download requires an options object');
    this.opts = opts;
  }
  start() {

    progress(
        request(this.opts.url), {
          lengthHeader: 'x-transfer-length' // Length header to use, defaults to content-length
        })
      .pipe(fs.createWriteStream(this.opts.location))
      /* Events */
      .on('progress', (state) => {
        this.emit('progress', state);
      })
      .on('error', (err) => {
        this.emit('error', err);
      })
      .on('end', () => {

        // no optional check sum passed
        if (!this.opts.checksum) {
          this.emit('done', this.opts.location);
          return;
        }

        // Checksum File. Emit error if it fails, otherwise return new file location;
        checksum.file(this.opts.location, (err, sum) => {
          if (err) {
            this.emit('error', err);
          }
          else if (sum !== this.opts.checksum) {
            this.emit('error', new Error(`Checksum does not match passed sum for file ${this.opts.location}`));
          }
          else {
            this.emit('done', this.opts.location);
          }
        });
        
      });
  }
}
