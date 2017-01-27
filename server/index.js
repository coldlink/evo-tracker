'use strict'

const express = require('express')
const config = require('./config/environment')
const mongoose = require('mongoose')

// Connect to database
mongoose.Promise = global.Promise
mongoose.connect(config.mongo.uri, config.mongo.options)
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error: ' + err)
  process.exit(-1)
})

const app = express()

const server = require('http').createServer(app)

require('./config/express')(app)
require('./routes')(app)
require('./socketio')(server)

server.listen(config.port, config.ip, () => console.log(`Express server listening on ${config.port}, in ${app.get('env')} mode`))

exports = module.exports = app
