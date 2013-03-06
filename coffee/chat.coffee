server = io.connect('http://localhost:3000')

server.on 'connect', (data) ->
  name = prompt("What is your name?")
  server.emit('join', name)

server.on 'join', (name) ->
  console.log name
  $('ul#users').append("<li>" + name + "</li>")