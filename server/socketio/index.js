'use strict'

module.exports = function (server) {
  const io = require('socket.io')(server)
  const API = require('../api')
  let users = 0

  io.on('connection', (socket) => {
    users++
    console.log('User Connect: ', users)
    socket.emit('data', API.getData())
    socket.on('disconnect', () => {
      users--
      console.log('User Disconnect: ', users)
    })
  })

  setInterval(() => {
    io.emit('data', API.getData())
  }, 60000)
}
