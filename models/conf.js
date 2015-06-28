var STEBENEVA_HOME = process.env.HOME_DIR || process.env.HOME;
var Promise = require('bluebird');
var path = require('path');
var confPath = path.resolve(STEBENEVA_HOME + '/.stebeneva.ru/photos/conf.json');
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

function _delete(section, file) {
  return new Promise(function(resolve, reject) {
    fs.readFile(confPath, 'utf8', function (err, conf) {
      if (err) {
        return reject(err);
      }
      try {
        conf = JSON.parse(conf);
      } catch (err) {
        console.log(conf);
        return reject(err);
      }
      delete conf[section][file];

      fs.writeFile(confPath, JSON.stringify(conf, null, 2), function (err) {
        if (err) {
          return reject(err);
        }
        return resolve(conf);
      });
    });
  });
}

var confModel = {
  save: save,
  delete: _delete,
};
module.exports = confModel;;
