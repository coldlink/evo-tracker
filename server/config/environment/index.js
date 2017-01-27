'use strict'

const path = require('path')

const all = {
  env: process.env.NODE_ENV || 'development',

  root: path.normalize(path.resolve()),

  port: process.env.PORT || 9000,

  ip: process.env.IP || '0.0.0.0'
}

module.exports = all
