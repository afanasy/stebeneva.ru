var conf = require('../libs/conf');

function confMiddleware(req, res, next) {
  conf()
    .then(function (json) {
      req.app.locals.conf = json;
      req.app.locals.ucfirst = function(value){
          return value.charAt(0).toUpperCase() + value.slice(1);
      };
      return next();
    });
}

module.exports = confMiddleware;
