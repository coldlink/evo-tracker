'use strict'

module.exports = function (server) {
  const io = require('socket.io')(server)
  const API = require('../api')

  io.on('connection', (socket) => {
    socket.emit('data', API.getData())
  })

  setInterval(() => {
    io.emit('data', API.getData())
  }, 60000)
}
