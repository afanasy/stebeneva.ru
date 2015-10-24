var Promise = require('bluebird'),
fs = Promise.promisifyAll(require('fs')),
path = require('path'),
CONF_PATH = path.resolve(__dirname, 'conf.json'),
HOME_DIR

try {
  HOME_DIR = __dirname.match(/^\/home\/\S+?\//)[0]
} catch (e) {
  console.log('Cannot find home folder, does this file placed under home folder?', e)
  throw e
}

function init(file) {

  // try to read conf.json
  CONF_PATH = file || CONF_PATH

  return fs.readFileAsync(CONF_PATH, 'utf8').
    then(function (text) {
      if (!text) throw new Error('Error')
      return JSON.parse(text)
    }).
    catch(function () {

      // failed, create conf from folder
      var folders = [
        'studio',
        'portrait',
        'reportage',
        'models',
        'travel'
      ]

      return Promise.map(folders, readFolder).
        then(function (results) {

          results = results.
            filter(function (res) {
              return res.isFulfilled()
            }).
            map(function (res) {
              return res.value()
            })
          return results.
            reduce(function (conf, result) {
              files = {}

              result.files.forEach(function (file) {
                files[file] = false
              })

              conf[result.folder] = files
              return conf
            }, {})
        })
        .then(function (conf) {
          return save(conf)
        })

    })

  function readFolder(folder) {
    var folderPath = path.resolve(HOME_DIR, '.stebeneva.ru/photos/', folder, '/slides')

    return fs.readdirAsync(folderPath).
      then(function (files) {
        files = files.filter(function (file) {

          return /jpg|png|gif|bmp$/.test(file)

        })

        return {
          folder: folder,
          files: files
        }

      }).
      reflect()
  }
}

function save(conf) {
  return new Promise(function(resolve, reject) {
    if (typeof conf === 'string') {
      conf = JSON.parse(conf)
    }

    fs.writeFile(CONF_PATH, JSON.stringify(conf, null, 2), function (err) {
      if (err) return reject(err)
      return resolve(conf)
    })

  })
}

function _delete(section, file) {
  return new Promise(function(resolve, reject) {
    fs.readFile(CONF_PATH, 'utf8', function (err, conf) {
      if (err) return reject(err)
      try {
        conf = JSON.parse(conf)
      } catch (err) {
        console.log(conf)
        return reject(err)
      }
      delete conf[section][file]

      fs.writeFile(CONF_PATH, JSON.stringify(conf, null, 2), function (err) {
        if (err) return reject(err)
        return resolve(conf)
      })
    })
  })
}

var conf = {
  init: init,
  save: save,
  delete: _delete
}

module.exports = conf
