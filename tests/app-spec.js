var
  express = require('express'),
  vhost = require('vhost'),
  app = express()
var stebeneva = require('../app');
app.use(vhost('stebeneva.mimma.local' /* my local hostname*/, stebeneva));
app.listen(3000);
