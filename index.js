var _ = require('underscore')
var express = require('express')
var sharp = require('sharp')
var packageName = require('./package').name
var config = _.extend(require('./config'), require(__dirname + '/../.' + packageName))
var db = require('./db')
var adminRouter = require('./admin/router')

module.exports = express().
  set('views', __dirname + '/views').
  set('view engine', 'pug').
  use(express.static(__dirname + '/public')).//, {maxAge: '1 day'})).
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
  use('/admin', adminRouter)
