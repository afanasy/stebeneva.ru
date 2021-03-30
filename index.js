var _ = require('underscore')
var express = require('express')
var sharp = require('sharp')
var packageName = require('./package').name
var config = _.extend(require('./config'), require(__dirname + '/../.' + packageName))
var db = require('./db')
var adminRouter = require('./admin/router')
var photoField = ['id', 'created', 'sectionId', 'filename', 'content', 'frontpage', 'position']

module.exports = express().
  set('views', __dirname + '/views').
  set('view engine', 'pug').
  use(express.static(__dirname + '/public')).//, {maxAge: '1 day'})).
  use((req, res, next) => {
    res.locals.googleAnalytics = config.googleAnalytics
    res.locals.config = {}
    db.select('section', (err, data) => {
      res.locals.config.section = data
      db.select('photo', {}, _.without(photoField, 'content'), (err, data) => {
        res.locals.config.photo = _.sortBy(data, 'position')
        next()
      })
    })
  }).
  use('/admin', adminRouter).
  get('/photo/:id/:type', (req, res) => {
    db.select('photo', +req.params.id, 'content', (err, content) => {
      if (!content)
        return res.sendStatus(404)
      res.set('Cache-Control', 'public, max-age=31536000')
      if (req.params.type == 'thumb')
        return sharp(content).resize(config.thumbSize, config.thumbSize).pipe(res)
      res.end(content)
    })
  }).
  get(
    [
      '/',
      '/photo/:section',
      '/contact'
    ], 
    (req, res) => {
      res.render('index')
    }
  )
