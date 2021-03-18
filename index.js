var _ = require('underscore')
var express = require('express')
var bodyParser = require('body-parser')
var sharp = require('sharp')
var multer = require('multer')
var fs = require('fs')
var uniqid = require('uniqid')
var config = require('./config')
var packageName = require('./package').name

var photosDir = __dirname + '/../.' + packageName + '/photos'
var configPath = __dirname + '/../.' + packageName + '/config.json'

_.extend(config, require(configPath))

_.each(_.keys(config.section), section => {
  _.each(['thumbs', 'slides'], dir => {
    try {
      fs.mkdirSync(photosDir + '/' + section + '/' + dir)
    }
    catch (e) {}
  })
})

var app = module.exports = express().
  set('views', __dirname + '/views').
  set('view engine', 'pug').
  use(bodyParser.json()).
  use(bodyParser.urlencoded({extended: true})).
  use(express.static(__dirname + '/public')).
  use('/photos', express.static(photosDir)).
  use((req, res, next) => {
    res.locals = {
      conf: config.section,
      googleAnalytics: config.googleAnalytics
    }
    next()
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
    var file = _.findWhere(req.files, {fieldname: 'file'})
    if (file && config.section[req.body.section]) {
      var name = 'auto' + uniqid() + '.png'
      sharp(file.path).
        resize(config.slideSize.width, config.slideSize.height).
        toFile(photosDir + '/' + req.body.section + '/slides/' + name, () => {
          sharp(file.path).
            resize(config.thumbSize, config.thumbSize).
            toFile(photosDir + '/' + req.body.section + '/thumbs/' + name, () => {
              fs.unlink(file.path, () =>
                res.json({file: name})
              )
            })
        })
      return
    }
    if (req.body.action == 'save')
      config.section = JSON.parse(req.body.conf)
    if (req.body.action == 'delete') {
      if (config.section[req.body.section] && config.section[req.body.section][req.body.file]) {
        delete config.section[req.body.section][req.body.file]
        _.each(['thumbs', 'slides'], dir => {
          fs.unlink(photosDir + '/' + section + '/' + dir + '/' + name, _.noop)
        })
      }
    }
    fs.writeFile(configPath, JSON.stringify(config, null, 2), _.noop)
    res.json({})
  })
