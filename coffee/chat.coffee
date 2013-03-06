server = io.connect('http://localhost:3000')

server.on 'connect', (data) ->
  name = prompt("What is your name?")
  server.emit('join', name)
  addUser({name: name})

server.on 'join', (data) ->
  addUser(data)

server.on 'disconnect', (data) ->
  # remove from room
  $user = $("ul#users li[data-id=#{data.id}]")
  $user.remove()
  # show that they left in chat
  addMessage({name: data.name, message: "has left the room."})

addUser = (data) ->
  $('ul#users').append("<li data-id='#{data.id}'>#{data.name}</li>")

addMessage = (data) ->
  $msg = "<li>#{data.name}: #{data.message}</li>"
  $('ul#chat').append($msg)