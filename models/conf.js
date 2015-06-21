var Promise = require('bluebird');
var path = require('path');
var confPath = path.resolve(__dirname, '../public/photos/conf.json');
var fs = Promise.promisifyAll(require('fs'));

function save(conf) {
  return new Promise(function(resolve, reject) {
    if (typeof conf === 'string') {
      conf = JSON.parse(conf);
    }

    fs.writeFile(confPath, JSON.stringify(conf, null, 2), function (err) {
      if (err) {
        return reject(err);
      }
      return resolve(conf);
    });

  });
}

var confModel = {
  save: save,
};
module.exports = confModel;;
