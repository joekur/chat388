server = io.connect('http://localhost:3000')
my_name = null

server.on 'connect', (data) ->
  my_name = prompt("What is your name?")
  server.emit('join', my_name)
  addUser({name: my_name})

server.on 'join', (data) ->
  addUser(data)

server.on 'message', (data) ->
  addMessage(data)

server.on 'disconnect', (data) ->
  # remove from room
  $user = $("ul#users li[data-id=#{data.id}]")
  $user.remove()
  # show that they left in chat
  addMessage({name: data.name, message: "has left the room."})

$('#chat_form').submit ->
  $input = $('#message')
  msg = $input.val()
  $input.val('')

  server.emit('message', msg)
  addMessage({name: my_name, message: msg})

  return false

addUser = (data) ->
  $('ul#users').append("<li data-id='#{data.id}'>#{data.name}</li>")

addMessage = (data) ->
  $msg = "<li>#{data.name}: #{data.message}</li>"
  $('ul#chat').append($msg)