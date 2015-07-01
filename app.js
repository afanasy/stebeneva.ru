/**
 * Module dependencies.
 */

var express = require('express');
var serveStatic = require('serve-static');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var gd = require('node-gd');
var sharp = require('sharp');
var multer = require('multer');
var path = require('path');
var Promise = require('bluebird');
var fs = require('fs');
var fse = Promise.promisifyAll(require('fs-extra'));
var basicAuth = require('basic-auth');
var uniqid = require('uniqid');
var http = require('http');

var app = module.exports = express();

// constants
var MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB


// routes
var routes = require('./routes');

// libs
var conf = require('./conf');

// middlewares
var authConf = require(__dirname + '/.stebeneva.ru' + '/config');

var confMiddleware = function confMiddleware(req, res, next) {
  conf.init()
    .then(function (json) {
      req.app.locals.conf = json;
      req.app.locals.ucfirst = function(value){
          return value.charAt(0).toUpperCase() + value.slice(1);
      };
      return next();
    });
};
var handleUploadMiddleware = function handleUploadMiddleware() {
  return multer({
    dest: '/tmp/',
    limits: {
      fields: 5,
      fileSize: MAX_FILE_SIZE,
    },
    onFileUploadComplete: function (file, req, res) {
      saveGD(file, req.body.section)
        .then(function (file) {

          res.json({
            file: file
          });

        })
        .catch(function (err) {
          console.error(err.stack);
          res.end(500);
        });
    }
  });
}();
var authBasicMiddleware = function (req, res, next) {

  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.send(401);
  };

  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  };

  if (user.name === authConf.auth.username && user.pass === authConf.auth.password) {
    return next();
  } else {
    return unauthorized(res);
  };
};

// attach conf
app.use(confMiddleware);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(serveStatic(path.join(__dirname, 'public')));
app.use('/photos', serveStatic(__dirname + '/.stebeneva.ru/photos'));

// local only
if ('local' == app.get('env')) {
  app.use(express.errorHandler());
}

// attach public routes
app.get('/', routes.index);
app.get('/photo/:section', routes.photo);
app.get('/contact', routes.contact);

// attach admin routes
app.all('/admin', authBasicMiddleware, handleUploadMiddleware, routes.admin);

console.log('Initializing directories. Please wait..');
init()
  .then(function () {
    console.log('Directories initialized!');

    // dont have a parent -> called from command line
    if (!module.parent) {
      http.createServer(app).listen(app.get('port'), function(){
        console.info('Express server listening on port ' + app.get('port'));
      });

    }
  });



// utils function

// initial function, checking directory
function init() {
  var dir = path.resolve(__dirname, '.stebeneva.ru');
  // ensure dir will create folder if it is not exist
  return fse.ensureDirAsync(dir);
}

function saveGD(file, section) {
  var thumbWidth = 56;
  var thumbHeight = 56;
  var maxWidth = 675;
  var maxHeight = 450;
  var name = 'auto' + uniqid() + '.jpg';

  return new Promise(function(resolve, reject) {

    var source = sharp(file.path);
    source
      .metadata(function (err, metadata) {
        if (err) {
          return reject(err);
        }
        var width = metadata.width;
        var height = metadata.height;

        if (!width || !height) {
          return reject(new Error('File size error!' + width + 'x' + height));
        }

        var ratioWidth = width / maxWidth;
        var ratioHeight = height / maxHeight;

        // if size exceed max
        if((ratioWidth > 1) || (ratioHeight > 1)) {

          // get max ratio
          var ratio = Math.max(ratioWidth, ratioHeight);
          width = Math.floor(width / ratio);
          height = Math.floor(height / ratio);

          source = source.resize(width, height);
        }

        var thumbFile = __dirname + '/.stebeneva.ru/photos/' + section + '/thumbs/' + name;
        var slideFile = __dirname + '/.stebeneva.ru/photos/' + section + '/slides/' + name;
        source
          .toFile(slideFile)
          .then(function () {
            source.resize(thumbWidth, thumbHeight);
            return source.toFile(thumbFile);
          })
          .then(function () {
            return fs.unlinkAsync(file.path);
          })
          .then(function () {
            return resolve(name);
          })
          .catch(function (err) {
            console.error(err.stack);
            return reject(err);
          });
      });
  });
}
