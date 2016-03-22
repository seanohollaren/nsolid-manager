'use strict';

var request = require('request');

/*
Make an request and return a promise.
Assumes incoming body is JSON and parseable.
*/
function requestAsync(url) {
  return new Promise(function (resolve, reject) {
    request(url, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        try {
          var jsonBody = JSON.parse(body);
          resolve(jsonBody);
        } catch (e) {
          reject(new Error('Problem parsing incoming json for ' + url));
        }
      } else {
        reject(error || new Error('Invalid response from ' + url));
      }
    });
  });
}

module.export = {
  requestAsync: requestAsync
};