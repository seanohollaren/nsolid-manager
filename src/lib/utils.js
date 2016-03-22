'use strict';
const request = require('request');

/*
Make an request and return a promise.
Assumes incoming body is JSON and parseable.
*/
function requestAsync(url) {
  return new Promise((resolve, reject) => {
    request({
      url,
      headers: {
        'user-agent': 'nsolid-manager'
      }
    }, (error, response, body) => {

      if (!error && response.statusCode === 200) {
        try {
          const jsonBody = JSON.parse(body);
          resolve(jsonBody);
        }
        catch (e) {
          reject(new Error(`Problem parsing incoming json for ${url}`));
        }
      }
      else {
        reject(error || new Error(`Invalid response from ${url}`));
      }
    });
  });
}

/*
Accepts a string that is formatted in template string
format, and returns a new string
*/
function templateString(string, context) {
  return string.replace(/\$\{([^\$\{\}\r\n]*)\}/g, (match, id) => context[id]);
}

module.exports = {
  requestAsync,
  templateString
};
