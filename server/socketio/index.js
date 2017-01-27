'use strict'

module.exports = function (server) {
  const io = require('socket.io')(server)
  const API = require('../api')
  let users = 0

  io.on('connection', (socket) => {
    users++
    console.log('User Connect: ', users)
    socket.emit('data', API.getData())
    socket.emit('initialchartdata', API.getChartData())
    socket.on('disconnect', () => {
      users--
      console.log('User Disconnect: ', users)
    })
  })

  setInterval(() => {
    io.emit('data', API.getData())
  }, 1 * 60 * 1000)

  setInterval(() => {
    io.emit('chartdata', API.getChartData())
  }, 5 * 60 * 1000)
}
