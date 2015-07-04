/**
 * Module dependencies.
 */

var express = require('express'),
serveStatic = require('serve-static'),
bodyParser = require('body-parser'),
morgan = require('morgan'),
gd = require('node-gd'),
sharp = require('sharp'),
multer = require('multer'),
path = require('path'),
Promise = require('bluebird'),
fs = require('fs'),
fse = Promise.promisifyAll(require('fs-extra')),
basicAuth = require('basic-auth'),
uniqid = require('uniqid'),
http = require('http'),

app = module.exports = express(),

// constants
MAX_FILE_SIZE = 100 * 1024 * 1024 * 1024, // 100MB


// routes
routes = require('./routes'),

// libs
conf = require('./conf'),
authConf,
imageConf,

// middlewares,
files = [
  'conf.json',
  'config.json'
]

files.map(function (file) {
  fse.ensureFileSync(path.resolve(__dirname, file))
})

try {
  authConf = fse.readJsonSync(path.resolve(__dirname, 'config.json'))
} catch (e) {
  authConf = {
    auth: {
      username: 'test',
      password: 'test'
    }
  }
  fse.writeJsonSync(path.resolve(__dirname, 'config.json'), authConf)
}

confMiddleware = function confMiddleware(req, res, next) {
  conf.
    init().
    then(function (json) {
      req.app.locals.conf = json
      req.app.locals.ucfirst = function(value){
          return value.
            charAt(0).
            toUpperCase() +
            value.
            slice(1)
      }
      return next()
    })
},
handleUploadMiddleware = function handleUploadMiddleware() {
  return multer({
    dest: '/tmp/',
    limits: {
      fields: 5,
      fileSize: MAX_FILE_SIZE
    },
    onFileUploadComplete: function (file, req, res) {
      saveGD(file, req.body.section).
        then(function (file) {

          res.json({
            file: file
          })

        }).
        catch(function (err) {
          console.error(err.stack)
          res.end(500)
        })
    }
  })
}(),
authBasicMiddleware = function (req, res, next) {

  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required')
    return res.send(401)
  }

  var user = basicAuth(req)

  if (!user || !user.name || !user.pass) {
    return unauthorized(res)
  }

  if (user.name === authConf.auth.username && user.pass === authConf.auth.password) {
    return next()
  } else {
    return unauthorized(res)
  }
}

// attach conf
app.use(confMiddleware)

// all environments
app.set('port', process.env.PORT || 3000)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')
app.use(morgan('dev'))
app.use(bodyParser.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({limit: '50mb', extended: false }))
app.use(serveStatic(path.join(__dirname, 'public')))
app.use('/photos', serveStatic(__dirname + '/.stebeneva.ru/photos'))

// local only
if ('local' === app.get('env')) {
  app.use(express.errorHandler())
}

// attach public routes
app.get('/', routes.index)
app.get('/photo/:section', routes.photo)
app.get('/contact', routes.contact)

// attach admin routes
app.all('/admin', authBasicMiddleware, handleUploadMiddleware, routes.admin)

console.log('Initializing directories. Please wait..')
init().
  then(function () {
    console.log('Directories initialized!')

    // dont have a parent -> called from command line
    if (!module.parent) {
      http.createServer(app).listen(app.get('port'), function(){
        console.info('Express server listening on port ' + app.get('port'))
      })

    }
  })



// utils function

// initial function, checking directory
function init() {
  var dirs = [
    'models',
    'portrait',
    'reportage',
    'studio',
    'travel'
  ]

  // ensure dir will create folder structure if it is not exist
  return Promise.map(dirs, function (dir) {
    dir = [
      path.resolve(__dirname, '.stebeneva.ru', 'photos', dir, 'slides'),
      path.resolve(__dirname, '.stebeneva.ru', 'photos', dir, 'thumbs')
    ]
    return Promise.map(dir, function (_dir) {
      fse.ensureDirAsync(_dir)
    })
  })
  .then(function () {
    return conf.init()
  })
}

function saveGD(file, section) {
  var thumbWidth = 56,
  thumbHeight = 56,
  maxWidth = 675,
  maxHeight = 450,
  name = 'auto' + uniqid() + '.jpg'

  return new Promise(function(resolve, reject) {

    var source = sharp(file.path)
    source.
      metadata(function (err, metadata) {
        if (err) {
          return reject(err)
        }
        var width = metadata.width,
        height = metadata.height

        if (!width || !height) {
          return reject(new Error('File size error!' + width + 'x' + height))
        }

        var ratioWidth = width / maxWidth,
        ratioHeight = height / maxHeight

        // if size exceed max
        if ((ratioWidth > 1) || (ratioHeight > 1)) {

          // get max ratio
          var ratio = Math.max(ratioWidth, ratioHeight)
          width = Math.floor(width / ratio)
          height = Math.floor(height / ratio)

          source = source.resize(width, height)
        }

        var thumbFile = __dirname + '/.stebeneva.ru/photos/' + section + '/thumbs/' + name,
        slideFile = __dirname + '/.stebeneva.ru/photos/' + section + '/slides/' + name

        source.
          toFile(slideFile).
          then(function () {

            return source.
              resize(thumbWidth, thumbHeight).
              toFile(thumbFile)

          }).
          then(function () {
            return fs.unlinkAsync(file.path)
          }).
          then(function () {
            return resolve(name)
          }).
          catch(function (err) {
            console.error(err.stack)
            return reject(err)
          })
      })
  })
}
