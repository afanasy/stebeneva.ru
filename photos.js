var Promise = require('bluebird'),
fs = Promise.promisifyAll(require('fs')),
path = require('path'),
rootDir = path.resolve(__dirname, '../public/photos')

function get(section, file) {
  return path.resolve(rootDir, section, 'slides', file)
}

function getThumb(section, file) {
  return path.resolve(rootDir, section, 'thumbs', file)
}

function _delete(section, file) {
  var filepath = get(section, file),
  thumbpath = getThumb(section, file)
  return new Promise(function(resolve, reject) {
    fs.unlink(filepath, function () {
      fs.unlink(thumbpath, function () {
        return resolve()
      })
    });
  });
}

var photos = {
  get: get,
  getThumb: getThumb
}
photos.delete = _delete
module.exports = photos
