'use strict'

const morgan = require('morgan')
const path = require('path')
const express = require('express')

module.exports = function (app) {
  app.use(morgan('combined'))
  app.use(express.static(path.resolve() + '/client'))
}
