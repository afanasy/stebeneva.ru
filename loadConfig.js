var _ = require('underscore')
var db = require('./db')
var photoField = ['id', 'created', 'sectionId', 'filename', 'content', 'frontpage', 'position']

module.exports = done => {
  var config = {}
  db.select('section', (err, data) => {
    config.section = data
    db.select('photo', {}, _.without(photoField, 'content'), (err, data) => {
      config.photo = _.sortBy(data, 'position')
      done(null, config)
    })
  })
}

module.exports.photoField = photoField
