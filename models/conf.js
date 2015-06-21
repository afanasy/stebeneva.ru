var Promise = require('bluebird');
var path = require('path');
var confPath = path.resolve(__dirname, '../public/photos/conf.json');
var fs = Promise.promisifyAll(require('fs'));

function save(conf) {
  return new Promise(function(resolve, reject) {
    if (typeof confPath === 'string')
      confPath = JSON.parse(confPath);
      
    fs.writeFile(confPath, conf, function (err) {
      if (err) {
        return reject(err);
      }
      return resolve();
    });

  });
}

var confModel = {
  save: save,
};
module.exports = confModel;;
