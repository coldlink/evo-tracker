'use strict'

const config = require('./config/environment')
const mongoose = require('mongoose')

// Connect to database
mongoose.Promise = global.Promise
mongoose.connect(config.mongo.uri, config.mongo.options)
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error: ' + err)
  process.exit(-1)
})

// set up worker
require('./generosity')

console.log('Worker Started')
