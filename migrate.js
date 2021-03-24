var _ = require('underscore')
var async = require('async')
var fs = require('fs')
var config = require('./config')
var packageName = require('./package').name
var photosDir = __dirname + '/../.' + packageName + '/photos'
var configPath = __dirname + '/../.' + packageName + '/config.json'
var db = require('./db')
var count = 0

console.time('done')
function done () {
  console.log('count', count)
  db.end()
  console.timeEnd('done')
}

_.extend(config, require(configPath))

async.eachSeries(_.keys(config.section), (name, done) => {
  var section
  async.series([
    done => {
      db.select('section', {name}, (err, data) => {
        section = data[0]
        done()
      })
    },
    done => {
      if (section)
        return done()
      db.insert('section', {name: name, created: {now: true}}, (err, data) => {
        section = {id: data.insertId}
        done()
      })
    }
  ],
  () => {
    var position = 0
    async.eachSeries(_.keys(config.section[name]), (filename, done) => {
      var photo
      position++
      count++
      async.series([
        done => {
          db.select('photo', {sectionId: section.id, filename: filename}, (err, data) => {
            photo = data[0]
            done()
          })
        },
        done => {
          if (photo)
            return done()
          db.insert('photo', {created: {now: true}, sectionId: section.id, filename: filename, frontpage: +config.section[name][filename], position: position}, (err, data) => {
            if (err)
              console.log(err)
            photo = {id: data.insertId}
            var tmp = '/var/lib/mysql-files/stebeneva.ru' + filename
            fs.copyFile(__dirname + '/../.' + packageName + '/photos/' + name + '/slides/' + filename, tmp, (err, data) => {
              if (err)
                console.log(err)
              db.query('update ?? set ?? = load_file(?) where ?', ['photo', 'content', tmp, {id: photo.id}], (err, data) => {
                if (err)
                  console.log(err)
                fs.unlink(tmp, done)
              })
            })
          })
        }
      ], done)
    }, done)
  })
}, done)
