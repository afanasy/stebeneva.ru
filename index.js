var _ = require('underscore')
var express = require('express')
var sharp = require('sharp')
var packageName = require('./package').name
var config = _.extend(require('./config'), require(__dirname + '/../.' + packageName))
var db = require('./db')
var adminRouter = require('./admin/router')
var loadConfig = require('./loadConfig')
var cacheControl = 'public, max-age=31536000'
var cache = {}

function binary (id, type, done) {
  function content (id, done) {
    if (cache[id].content)
      return done(null, cache[id].content)
    db.select('photo', +id, 'content', (err, content) => {
      if (!content)
        return done(404)
      cache[id].content = content
      cache[id].slide = content      
      done(null, cache[id].content)
    })
  }
  cache[id] = cache[id] || {}
  if (cache[id][type])
    return done(null, cache[id][type])
  content(id, (err, content) => {
    if (err)
      return done(err)
    if (type == 'slide')
      return done(null, cache[id][type])
    sharp(content).resize(config.thumbSize, config.thumbSize).toBuffer((err, data) => {
      cache[id][type] = data
      done(null, cache[id][type])
    })
  })
}

module.exports = express().
  set('views', __dirname + '/views').
  set('view engine', 'pug').
  use(express.static(__dirname + '/public', {maxAge: '1 year'})).
  use('/admin', adminRouter).
  get('/photo/:id/:type', (req, res) => {
    binary(req.params.id, req.params.type, (err, data) => {
      if (err)
        return res.sendStatus(err)
      res.set('Cache-Control', cacheControl)
      res.end(data)
    })
  }).
  get(
    [
      '/',
      '/photo/:section',
      '/contact'
    ], 
    (req, res) => {
      loadConfig((err, data) => {
        if (!req.headers['if-none-match'])
          _.each(data.photo, photo => {
            res.push('/photo/' + photo.id + '/thumb', {response: {'Cache-Control': cacheControl}}, (err, stream) => {
              if (stream)
                binary(photo.id, 'thumb', (err, data) => {
                  stream.end(data)
                })
            })
          })
        res.render('index', {googleAnalytics: config.googleAnalytics, config: data})
      })
    }
  )
