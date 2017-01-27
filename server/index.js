'use strict'

const express = require('express')
const config = require('./config/environment')

const app = express()

const server = require('http').createServer(app)

require('./config/express')(app)
require('./routes')(app)
require('./socketio')(server)

server.listen(config.port, config.ip, () => console.log(`Express server listening on ${config.port}, in ${app.get('env')} mode`))

exports = module.exports = app
