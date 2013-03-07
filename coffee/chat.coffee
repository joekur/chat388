server = io.connect('http://localhost:3000')
my_name = null
last_message_user_id = null

server.on 'connect', (data) ->
  my_name = prompt("What is your name?")
  server.emit('join', my_name)
  addUser({name: my_name})

server.on 'join', (data) ->
  addUser(data)
  addMessage({name: "", message: "#{data.name} has joined the room", status: true})

server.on 'in room', (data) ->
  addUser(data)

server.on 'message', (data) ->
  addMessage(data)

server.on 'disconnect', (data) ->
  # remove from room
  $user = $("ul#users li[data-id=#{data.id}]")
  $user.remove()
  # show that they left in chat
  addMessage({name: "", message: "#{data.name} has left the room.", status: true})

$('#chat_form').submit ->
  $input = $('#message')
  msg = $input.val()
  $input.val('')

  server.emit('message', msg)
  addMessage({name: my_name, user_id: server.socket.sessionid, message: msg})

  return false

addUser = (data) ->
  $user = $("<li data-id='#{data.id}'></li>")
  $user.text(data.name)
  $('ul#users').append $user

addMessage = (data) ->
  $msg = $("<div class='message'></div>")
  $msg.text(data.message)
  if last_message_user_id == data.user_id
    $("#chat li").last().find('.messages').append($msg)
  else
    $msg_container = $("<li><div class='name'>#{data.name}</div><div class='messages'></div></li>")
    $msg_container.find('.messages').append($msg)
    $msg_container.addClass('status') if data.status
    $msg_container.addClass('me') if data.user_id == server.socket.sessionid
    $('ul#chat').append($msg_container)
  last_message_user_id = data.user_id