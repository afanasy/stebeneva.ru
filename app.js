require('dotenv').load();
var STEBENEVA_HOME = process.env.HOME_DIR || process.env.HOME;
/**
 * Module dependencies.
 */

var express = require('express');
var fs = require('fs');
var gd = require('node-gd');
var multer = require('multer');
var path = require('path');
var Promise = require('bluebird');
var uniqid = require('uniqid');

var app = module.exports = express();

// constants
var MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB


// routes
var routes = require('./routes');

// libs
var conf = require('./libs/conf');

// middlewares
var basicAuth = require('basic-auth');
var authConf = require(STEBENEVA_HOME + '/.stebeneva.ru' + '/config');

var confMiddleware = function confMiddleware(req, res, next) {
  conf()
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
//app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/photos', express.static(STEBENEVA_HOME + '/.stebeneva.ru/photos'));

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


// utils function
function saveGD(file, section) {
  var thumbWidth = 56;
  var thumbHeight = 56;
  var maxWidth = 675;
  var maxHeight = 450;
  var name = 'auto' + uniqid() + '.jpg';

  return new Promise(function(resolve, reject) {

    gd.openJpeg(file.path, function (err, source) {
      if (err) {
        return reject(err);
      }

      var width = source.width;
      var height = source.height;

      if (!width || !height) {
        return reject(new Error('File size error!' + width + height));
      }
        var thumb = gd.createTrueColor(thumbWidth, thumbHeight);


        var ratioWidth = width / maxWidth;
        var ratioHeight = height / maxHeight;

        // if size exceed max
        if((ratioWidth > 1) || (ratioHeight > 1)) {

          // get max ratio
          var ratio = Math.max(ratioWidth, ratioHeight);
          var targetWidth = Math.floor(width / ratio);
          var targetHeight = Math.floor(height / ratio);

          var target = gd.createTrueColor(targetWidth, targetHeight);

          // gd.Image#copyResampled(dest, dx, dy, sx, sy, dw, dh, sw, sh)
          source.copyResampled(target, 0, 0, 0, 0, targetWidth, targetHeight, width, height);
          source = target;
          width = targetWidth;
          height = targetHeight;
        }

        var x = 0;
        var y = 0;

        var size = Math.min(width, height);
        var offset = Math.abs(width - height) / 2;

        if (width > height)
          x += offset;
        else
          y += offset;

        x = Math.floor(x);
        y = Math.floor(y);

        source.copyResampled(thumb, 0, 0, +x, +y, thumbWidth, thumbHeight, size, size);
        thumb.saveJpeg(STEBENEVA_HOME + '/.stebeneva.ru/photos/' + section + '/thumbs/' + name, 100, function (err) {
          if (err) {
            return reject(err);
          }
          source.saveJpeg(STEBENEVA_HOME + '/.stebeneva.ru/photos/' + section + '/slides/' + name, 100, function (err) {
            if (err) {
              return reject(err);
            }
            fs.unlinkAsync(file.path)
              .then(function () {
                return resolve(name);
              })
              .catch(function (err) {
                console.error(err.stack);
                return reject(err);
              });
          });

        });

      })
  });
}
