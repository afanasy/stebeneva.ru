var maxFileSize = 100 * 1024 * 1024; // 100MB
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var basicAuth = require('basic-auth');
var multer = require('multer');
var uniqid = require('uniqid');
var fs = require('fs');
var Promise = require('bluebird');
var gd = require('node-gd');

var routes = require('./routes');
var conf = require('./conf');
var authConf = require('./config');
var app = express();

// attach conf
app.use(function (req, res, next) {
  conf()
    .then(function (json) {
      app.locals.conf = json;
      app.locals.ucfirst = function(value){
          return value.charAt(0).toUpperCase() + value.slice(1);
      };
      return next();
    });
});

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// local only
if ('local' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/photo/:section', routes.photo);
app.get('/contact', routes.contact);

var handleUploadMiddleware = handleUpload();
app.all('/admin', authBasic, handleUploadMiddleware, routes.admin);

http.createServer(app).listen(app.get('port'), function(){
  console.info('Express server listening on port ' + app.get('port'));
});


function authBasic(req, res, next) {
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

function handleUpload() {
  return multer({
    dest: './uploads/',
    limits: {
      fields: 5,
      fileSize: maxFileSize,
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
}

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
          console.log('source, 0, 0, 0, 0, targetWidth, targetHeight, width, height', source, 0, 0, 0, 0, targetWidth, targetHeight, width, height);
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
        thumb.saveJpeg(path.resolve(__dirname, 'public/photos', section, 'thumbs', name), 100, function (err) {
          if (err) {
            return reject(err);
          }
          source.saveJpeg(path.resolve(__dirname, 'public/photos', section, 'slides', name), 100, function (err) {
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
