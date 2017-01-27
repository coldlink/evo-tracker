'use strict'

const path = require('path')

module.exports = function (app) {
  app.route(`/robots.txt`).get((req, res) => {
    res.type('text/plain')
    res.send('User-agent: *')
  })

  app.route('/*').get((req, res) => res.sendFile(path.resolve() + '/client/index.html'))
}
