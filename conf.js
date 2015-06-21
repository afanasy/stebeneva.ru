var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var path = require('path');


function init(file) {
  // try to read conf.json
  var confPath = file || path.resolve(__dirname, 'public/photos/conf.json');
  return fs.readFileAsync(confPath, 'utf8')
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
    var folderPath = path.resolve(__dirname, 'public/photos', folder, 'slides');
    return fs.readdirAsync(folderPath)
      .then(function (files) {
        files = files.filter(function (file) {
          return /jpg$/.test(file);
        });
        return {
          folder: folder,
          files: files,
        };
      })
      .reflect();
  }
}
module.exports = init;
