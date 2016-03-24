'use strict';

const paramHelpers = require('../lib/paramHelpers');
const expect = require('chai').expect;

describe('Param Helpers', function() {

  // TODO (Sean): Refactor validateParms into a more testable format

  describe('processParams', function() {

    it('Should use specified appPath', function(done) {

      const args = {
        _: ['../foo/app.js']
      };

      const expectedAppPath = '../foo/app.js';

      const result = paramHelpers.processParams(args);

      expect(result).to.have.property('appPath').which.equals(expectedAppPath);

      done();

    });

    it('Should use appPath given with --path flag', function(done) {

      const args = {
        _: [],
        path: '../foo/app.js'
      };

      const expectedAppPath = '../foo/app.js';

      const result = paramHelpers.processParams(args);

      expect(result).to.have.property('appPath').which.equals(expectedAppPath);

      done();

    });

    it('Should use appPath given with -p flag', function(done) {

      const args = {
        _: [],
        p: '../foo/app.js'
      };

      const expectedAppPath = '../foo/app.js';

      const result = paramHelpers.processParams(args);

      expect(result).to.have.property('appPath').which.equals(expectedAppPath);

      done();

    });

    it('Should use appName given with --name flag', function(done) {

      const args = {
        _: [],
        name: 'testApp'
      };

      const expectedAppName = 'testApp';

      const result = paramHelpers.processParams(args);

      expect(result).to.have.property('appName').which.equals(expectedAppName);

      done();

    });

    it('Should use appName given with -n flag', function(done) {

      const args = {
        _: [],
        n: 'testApp'
      };

      const expectedAppName = 'testApp';

      const result = paramHelpers.processParams(args);

      expect(result).to.have.property('appName').which.equals(expectedAppName);

      done();

    });

    it('Should fall back to file name (given in-line) when name isn\'t specified', function(done) {

      const args = {
        _: ['../foo/app.js']
      };

      const expectedAppName = 'app.js';

      const result = paramHelpers.processParams(args);

      expect(result).to.have.property('appName').which.equals(expectedAppName);

      done();

    });

    it('Should fall back to file name (given via flag) when name isn\'t specified', function(done) {

      const args = {
        _: [],
        p: '../foo/app.js'
      };

      const expectedAppName = 'app.js';

      const result = paramHelpers.processParams(args);

      expect(result).to.have.property('appName').which.equals(expectedAppName);

      done();

    });

    it('Should set helpRequested to true if --help flag is passed', function(done) {

      const args = {
        _: [],
        help: true
      };

      const expectedHelpResult = true;

      const result = paramHelpers.processParams(args);

      expect(result).to.have.property('helpRequested').which.equals(expectedHelpResult);

      done();

    });

    it('Should set helpRequested to true if \'help\' (case-insensitive) is passed in-line', function(done) {

      const args = {
        _: ['HELP']
      };

      const expectedHelpResult = true;

      const result = paramHelpers.processParams(args);

      expect(result).to.have.property('helpRequested').which.equals(expectedHelpResult);

      done();

    });

    it('Should return expected object when no arguments are passed', function(done) {

      const args = {
        _: []
      };

      const expectedParamObject = {
        appName: undefined,
        appPath: undefined,
        helpRequested: false
      };

      const result = paramHelpers.processParams(args);

      expect(result).to.deep.equal(expectedParamObject);

      done();

    });


  });

});
