var _ = require('underscore')
var async = require('async')
var express = require('express')
var bodyParser = require('body-parser')
var sharp = require('sharp')
var multer = require('multer')
var fs = require('fs')
var uniqid = require('uniqid')
var packageName = require('./package').name
var config = _.extend(require('./config'), require(__dirname + '/../.' + packageName))
var db = require('./db')

var app = module.exports = express().
  set('views', __dirname + '/views').
  set('view engine', 'pug').
  use(bodyParser.json()).
  use(bodyParser.urlencoded({extended: true})).
  use(express.static(__dirname + '/public', {maxAge: '1 day'})).
  get('/photos/:name/:type/:filename', (req, res) => {
    db.select('section', {name: req.params.name}, 'id', (err, data) => {
      if (!data[0])
        return res.sendStatus(404)
      db.select('photo', {sectionId: data[0], filename: req.params.filename}, 'content', (err, data) => {
        if (!data[0])
          return res.sendStatus(404)
        res.set('Cache-Control', 'public, max-age=86400')
        if (req.params.type == 'thumbs')
          return sharp(data[0]).resize(config.thumbSize, config.thumbSize).pipe(res)
        res.end(data[0])
      })
    })
  }).
  use((req, res, next) => {
    db.select('section', {}, ['id', 'name'], (err, section) => {
      db.select('photo', {}, ['id', 'sectionId', 'filename', 'frontpage', 'position'], (err, photo) => {
        config.section = _.object(_.map(section, d => [d.name, _.object(_.map(_.sortBy(_.where(photo, {sectionId: d.id}), d => +d.position), d => [d.filename, !!d.frontpage]))])),
        res.locals = {
          conf: config.section,
          googleAnalytics: config.googleAnalytics
        }
        next()
      })
    })
  }).
  get('/', (req, res) => {
    res.render('index')
  }).
  get('/photo/:section', (req, res) => {
    res.render('photo', {section: req.params.section})
  }).
  get('/contact', (req, res) => {
    res.render('contact')
  }).
  use('/admin',
    (req, res, next) => {
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
  get('/admin', (req, res) => {
    res.render('admin', {config: config})
  }).
  post('/admin', (req, res) => {
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
        db.update('photo', {sectionId: section.id, filename: req.body.file}, {frontpage: req.body.frontpage}, (err, data) => {
          res.json({})
        })
      })
      return
    }
    if (req.body.action == 'delete') {
      section((err, section) => {
        db.select('photo', {sectionId: section.id, filename: req.body.file}, ['id', 'position'], (err, data) => {
          if (!data[0])
            return done()
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
      _.each(JSON.parse(req.body.conf), (section, name) => {
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
