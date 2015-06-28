var STEBENEVA_HOME = process.env.HOME_DIR || process.env.HOME;
var multer = require('multer');
var Promise = require('bluebird');
var uniqid = require('uniqid');
var gd = require('node-gd');
var fs = require('fs');
var path = require('path');

var maxFileSize = 100 * 1024 * 1024; // 100MB

function handleUploadMiddleware() {
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

module.exports = handleUploadMiddleware;
