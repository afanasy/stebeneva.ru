var _ = require('underscore')
var async = require('async')
var express = require('express')
var bodyParser = require('body-parser')
var sharp = require('sharp')
var multer = require('multer')
var fs = require('fs')
var uniqid = require('uniqid')
var packageName = require('../package').name
var config = _.extend(require('../config'), require(__dirname + '/../../.' + packageName))
var db = require('../db')

module.exports = express.Router().
  use(bodyParser.json()).
  use(bodyParser.urlencoded({extended: true})).
  use(express.static(__dirname + '/ui')).//, {maxAge: '1 day'})).
  use((req, res, next) => {
      if (req.headers.authorization !== 'Basic ' + Buffer.from(config.auth.username + ':' + config.auth.password).toString('base64'))
        return res.set('WWW-Authenticate', 'Basic realm="' + packageName + '"').sendStatus(401)
      next()
    },
    multer({
      dest: '/tmp/',
      limits: {
        fileSize: 1 << 27, //134MB
      }
    }).any()
  ).
  get('/', (req, res) => {
    res.render(__dirname + '/index', {config: config})
  }).
  post('/', (req, res) => {
    function section (done) {
      if (!req.body.section)
        return done()
      db.select('section', {name: req.body.section}, ['id', 'name'], (err, data) => {
        if (!data[0])
          return res.sendStatus(400)
        done(err, data[0])
      })
    }
    var file = _.findWhere(req.files, {fieldname: 'file'})
    if (file) {
      section((err, section) => {
        var filename = 'auto' + uniqid() + '.png'
        db.insert('photo', {created: {now: true}, sectionId: section.id, filename: filename, position: _.size(config.section[section.name]) + 1}, (err, data) => {
          var photo = {id: data.insertId}
          var tmp = '/var/lib/mysql-files/stebeneva.ru/' + filename
          sharp(file.path).
            resize(config.slideSize.width, config.slideSize.height).
            toFile(tmp, () => {
              db.query('update ?? set ?? = load_file(?) where ?', ['photo', 'content', tmp, {id: photo.id}], () => {
                fs.unlink(file.path, () => {
                  fs.unlink(tmp, () => {
                    res.json({type: 'photo', id: photo.id, filename: filename})
                  })
                })
              })
            })
        })
      })
      return
    }
    if (req.body.action == 'update') {
      section((err, section) => {
        db.update('photo', {sectionId: section.id, filename: req.body.filename}, {frontpage: req.body.frontpage}, () => {
          res.json({})
        })
      })
      return
    }
    if (req.body.action == 'delete') {
      section((err, section) => {
        db.select('photo', {sectionId: section.id, filename: req.body.filename}, ['id', 'position'], (err, data) => {
          if (!data[0])
            return res.sendStatus(400)
          db.delete('photo', data[0].id, () => {
            db.query('update photo set position = position - 1 where position > ' + data[0].position, () => {
              res.json({})
            })
          })
        })
      })
      return
    }
    if (req.body.action == 'save') {
      var update = []
      _.each(req.body.conf, (section, name) => {
        var localSection = _.keys(config.section[name])
        _.each(_.keys(section), (filename, i) => {
          var indexOf = localSection.indexOf(filename)
          if ((indexOf >= 0) && (indexOf != i))
            update.push({name: name, filename: filename, position: i + 1})
        })
      })
      async.eachSeries(update, (update, done) => {
        db.select('section', {name: update.name}, ['id'], (err, data) => {
          db.update('photo', {sectionId: data[0].id, filename: update.filename}, {position: update.position}, done)
        })
      },
      () =>
        res.json({})
      )
      return
    }
    res.json({})
  })
