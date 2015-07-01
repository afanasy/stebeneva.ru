var express = require('express')
, vhost = require('vhost')
, app = express()
, stebeneva = require('../app')

app.use(vhost('stebeneva.mimma.local', stebeneva))
app.listen(3000)
