var STEBENEVA_HOME = process.env.HOME_DIR || process.env.HOME;
var basicAuth = require('basic-auth');
var authConf = require(STEBENEVA_HOME + '/.stebeneva.ru' + '/config');

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

module.exports = authBasic;
