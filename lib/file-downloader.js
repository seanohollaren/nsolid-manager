'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var checksum = require('checksum');
var progress = require('request-progress');
var fs = require('fs');
var request = require('request');
var EventEmitter = require('events').EventEmitter;

/*
Until this bug is fixed: https://github.com/eslint/eslint/issues/1801
We will not be enforcing indentation in eslint
*/
/* eslint indent: [0] */

/*
Download files to a location and validate checksum
Accepts: checksum, location, url
Emits: progress, error, done
*/

var FileDownloader = function (_EventEmitter) {
  _inherits(FileDownloader, _EventEmitter);

  function FileDownloader(opts) {
    _classCallCheck(this, FileDownloader);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(FileDownloader).call(this));

    if (!opts || (typeof opts === 'undefined' ? 'undefined' : _typeof(opts)) !== 'object') throw new Error('The File Download requires an options object');
    _this.opts = opts;
    return _this;
  }

  _createClass(FileDownloader, [{
    key: 'start',
    value: function start() {
      var _this2 = this;

      progress(request(this.opts.url), {
        throttle: 100,
        lengthHeader: 'x-transfer-length'
      }).on('progress', function (state) {
        _this2.emit('progress', state);
      }).on('error', function (err) {
        _this2.emit('error', err);
      }).on('end', function () {

        // no optional check sum passed
        if (!_this2.opts.checksum) {
          _this2.emit('done', _this2.opts.location);
          return;
        }

        // Checksum File. Emit error if it fails, otherwise return new file location;
        checksum.file(_this2.opts.location, {
          algorithm: _this2.opts.algorithm || 'sha256'
        }, function (err, sum) {
          if (err) {
            _this2.emit('error', err);
          } else if (sum !== _this2.opts.checksum) {
            _this2.emit('error', new Error('Checksum does not match passed sum for file ' + _this2.opts.location));
          } else {
            _this2.emit('done', _this2.opts.location);
          }
        });
      }).pipe(fs.createWriteStream(this.opts.location));
    }
  }]);

  return FileDownloader;
}(EventEmitter);

module.exports = FileDownloader;