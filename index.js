var
  _ = require('underscore'),
  express = require('express'),
  bodyParser = require('body-parser'),
  morgan = require('morgan'),
  sharp = require('sharp'),
  multer = require('multer'),
  fs = require('fs'),
  fsExtra = require('fs-extra'),
  basicAuth = require('basic-auth'),
  uniqid = require('uniqid'),
  config = require('./config'),
  name = require('./package').name,
  app = module.exports = express()

var home
try {
  home = __dirname.match(/^\/home\/[^\/]+/)[0]
} catch (e) {
  home = '/home/ubuntu'
}
home += '/.' + name

var photosDir = home + '/photos'
var configPath = home + '/config.json'

try {
  config = _.extend(config, require(configPath))
} catch (e) {}

_.each(_.keys(config.section), function (section) {
  _.each(['thumbs', 'slides'], function (dir) {
    fsExtra.ensureDir(photosDir + '/' + section + '/' + dir)
  })
})

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('public'))
app.use('/photos', express.static(photosDir))
app.use(function (req, res, next) {
  res.locals = {
    conf: config.section,
    googleAnalytics: config.googleAnalytics
  }
  next()
})

app.get('/', function (req, res) {
  res.render('index')
})
app.get('/photo/:section', function (req, res) {
  res.render('photo', {section: req.params.section})
})
app.get('/contact', function (req, res) {
  res.render('contact')
})

app.all('/admin',
  function (req, res, next) {
    var user = basicAuth(req)
    if (!user || (user.name !== config.auth.username) || (user.pass !== config.auth.password)) {
      res.setHeader('WWW-Authenticate', 'Basic realm="' + name + '"')
      res.sendStatus(401)
      return
    }
    next()
  },
  multer({
    dest: '/tmp/',
    limits: {
      fields: 5,
      fileSize: 100 * 1024 * 1024 * 1024, // 100MB
    },
    onFileUploadComplete: function (file, req, res) {
      var name = 'auto' + uniqid() + '.png'
      if (!config.section[req.body.section])
        return res.end()
      sharp(file.path).
        resize(config.slideSize.width, config.slideSize.height).
        crop('center').
        toFile(photosDir + '/' + req.body.section + '/slides/' + name, function () {
          sharp(file.path).
            resize(config.thumbSize, config.thumbSize).
            crop('center').
            toFile(photosDir + '/' + req.body.section + '/thumbs/' + name, function () {
              fs.unlink(file.path)
              res.json({file: name})
            })
        })
    }
  }),
  function (req, res) {
    if (req.method == 'GET')
      return res.render('admin', {config: config})
    if (req.body.action == 'save')
      config.section = JSON.parse(req.body.conf)
    if (req.body.action == 'delete') {
      if (config.section[req.body.section] && config.section[req.body.section][req.body.file]) {
        delete config.section[req.body.section][req.body.file]
        _.each(['thumbs', 'slides'], function (dir) {
          fs.unlink(photosDir + '/' + section + '/' + dir + '/' + name, _.noop)
        })
      }
    }
    fs.writeFile(configPath, JSON.stringify(config, null, 2), _.noop)
  }
)

if (!module.parent)
  app.listen(3000)
