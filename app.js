require('dotenv').load();
/**
 * Module dependencies.
 */

var express = require('express');
var path = require('path');

var routes = require('./routes');
var app = module.exports = express();

// middlewares

var confMiddleware = require('./middlewares/conf-middleware');
var handleUploadMiddleware = require('./middlewares/handle-upload-middleware')();
var authBasicMiddleware = require('./middlewares/auth-basic-middleware');

// attach conf
app.use(confMiddleware);

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
app.use('/photos', express.static(process.env.HOME + '/.stebeneva.ru/photos'));

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
