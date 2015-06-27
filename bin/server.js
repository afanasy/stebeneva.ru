var http = require('http');
var app = require('../app');


http.createServer(app).listen(app.get('port'), function(){
  console.info('Express server listening on port ' + app.get('port'));
});
