var fs = require('fs');
var gd = require('node-gd');
var path = require('path');

var photos = require('./photos');
var conf = require('./conf');

exports.index = function(req, res){
  res.render('index');
};

exports.photo = function (req, res) {
  res.render('photo', {section: req.params.section});
};

exports.contact = function (req, res) {
  res.render('contact');
};

exports.admin = function (req, res, next) {

  var conf = req.app.locals.conf;
  if (req.method === 'GET') {
    return res.render('admin');
  }


  if (req.method === 'POST') {
    // handle save action
    if (req.body.action === 'save') {

      conf.save(req.body.conf)
        .then(function (value) {
          return res.end();
        }, function (err) {
          return next(err);
        });

    } else if (req.body.action === 'delete') {

      var file = path.basename(req.body.file);
      var section = req.body.section;

      // check if section is in conf
      if (Object.keys(conf).indexOf(section) === -1) {
        // not, end it
        return res.end();
      }
      // yes, delete it
      return photos.delete(section, file)
        .then(function () {
          return conf.delete(section, file);
        })
        .then(function () {
          res.end();
        });

    }
  }

};
