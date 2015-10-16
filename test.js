var
  expect = require('expect.js'),
  supertest = require('supertest'),
  conf = require('./conf'),
  app = require('./app'),
  server = supertest.agent(app)

describe('server', function () {
  it('returns home page', function (done) {
    server.
      get('/').
      expect(200, done)
  })
})

describe('libvips functionality', function () {
  this.timeout(60 * 1000)

  describe('received image upload', function () {
    it('handles JPEG format', function (done) {
      server.
        post('/admin').
        set('Authorization', 'Basic dGVzdDp0ZXN0').
        field('section', 'travel').
        attach('file', __dirname + '/test-img/avatar.jpg').
        expect(200, done)
    })
    it('handles PNG format', function (done) {
      server.
        post('/admin').
        set('Authorization', 'Basic dGVzdDp0ZXN0').
        field('section', 'travel').
        attach('file', __dirname + '/test-img/akura.png').
        expect(200, done)
    })
  })
})

describe('Config function', function () {
  this.timeout(10000)

  it('should get config json', function (done) {
    conf.
      init().
      then(function (json) {
        expect(json.studio).to.be.ok
      }).
      then(done, done)
  })
})
