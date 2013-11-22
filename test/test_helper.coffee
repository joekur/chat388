chai = require 'chai'
chai.should()

io = require 'socket.io-client'
socketUrl = 'http://localhost:3001'
options = {
  'transports': ['websocket']
  'force new connection': true
  }

Factory = {
  newClient: ->
    io.connect(socketUrl, options)
  }

module.exports.Factory = Factory
