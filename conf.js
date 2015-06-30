var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');

function init(file) {
  var CONF_PATH = file || __dirname + '/.stebeneva.ru/photos/conf.json';
  // try to read conf.json

  return fs.readFileAsync(CONF_PATH, 'utf8')
    .then(function (text) {
      if (!text) throw new Error('Error');
      return JSON.parse(text);
    })
    .catch(function () {

      // failed, create conf from folder
      var folders = ['studio', 'portrait', 'reportage', 'models', 'travel'];

      return Promise.map(folders, readFolder)
        .then(function (results) {

          results = results.filter(function (res) {
            return res.isFulfilled();
          }).map(function (res) {
            return res.value();
          });

          return results.reduce(function (conf, result) {
            var files = {};

            result.files.forEach(function (file) {
              files[file] = false;
            });

            conf[result.folder] = files;

            return conf;
          }, {});
        })

    });

  function readFolder(folder) {
    var folderPath = __dirname + '/.stebeneva.ru/photos/' + folder + '/slides';

    return fs.readdirAsync(folderPath)
      .then(function (files) {
        files = files.filter(function (file) {

          return /jpg|png|gif|bmp$/.test(file);

        });

        return {
          folder: folder,
          files: files,
        };

      })
      .reflect();
  }
}

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

var conf = {
  init: init,
  save: save,
  delete: _delete,
};

module.exports = conf;
