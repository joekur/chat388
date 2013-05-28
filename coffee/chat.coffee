server = io.connect('/')
my_name = null
last_message_user_id = null
first_message_user_id = null

server.on 'connect', (data) ->
  my_name = Cookie.find('username')
  if _.isEmpty(my_name)
    my_name = prompt("What is your name?")
    Cookie.create('username', my_name)
  server.emit('join', my_name)
  addUser({name: my_name})

server.on 'join', (data) ->
  addUser(data)
  addMessage({name: "", message: "#{data.name} has joined the room", status: true})

server.on 'in room', (data) ->
  addUser(data)

server.on 'message', (data) ->
  addMessage(data)

server.on 'old_messages', (messages) ->
  console.log messages
  messages = messages.reverse()
  messages.forEach (message) ->
    addMessage(message, {prepend: true})

server.on 'disconnect', (data) ->
  # remove from room
  $user = $("ul#users li[data-id=#{data.id}]")
  $user.remove()
  # show that they left in chat
  addMessage({name: "", message: "#{data.name} has left the room.", status: true})

$('#chat_form').submit ->
  $input = $('#message')
  msg = $input.val()
  return false if msg == ''
  $input.val('')

  server.emit('message', msg)
  addMessage({name: my_name, user_id: server.socket.sessionid, message: msg})

  return false

$('h1').click ->
  server.emit('load_old_messages')

addUser = (data) ->
  $user = $("<li data-id='#{data.id}'></li>")
  $user.text(data.name)
  $('ul#users').append $user

addMessage = (data, opts) ->
  opts ||= {}
  $chat = $("#chat")
  $msg = $("<div class='message'></div>")
  $msg.text(data.message)
  add_to_ctr = if opts['prepend'] then (first_message_user_id == data.user_id) else (last_message_user_id == data.user_id)
  if add_to_ctr
    # add to existing container
    if opts['prepend']
      $messages = $("#chat li").first().find('.messages')
    else
      $messages = $("#chat li").last().find('.messages')
  else
    # create new user message container
    $msg_container = $("<li><div class='name'>#{data.name}</div><div class='messages'></div></li>")
    $msg_container.addClass('status') if data.status
    $msg_container.addClass('me') if data.user_id == server.socket.sessionid
    if opts['prepend']
      $chat.prepend($msg_container)
    else 
      $chat.append($msg_container)
    $messages = $msg_container.find('.messages')

  if opts['prepend']
    first_message_user_id = data.user_id
    $messages.prepend($msg)
  else
    last_message_user_id = data.user_id
    $messages.append($msg)

  $chat.scrollTop $chat[0].scrollHeight