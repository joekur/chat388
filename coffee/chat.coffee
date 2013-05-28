jQuery ->

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
    $("#username").text("Chatting as: #{my_name}")
    addUser({name: my_name})

  server.on 'join', (data) ->
    addUser(data)
    addMessage({name: "", message: "#{data.name} has joined the room", status: true})

  server.on 'in room', (data) ->
    addUser(data)

  server.on 'message', (data) ->
    addMessage(data, scroll: true)

  server.on 'old_messages', (data) ->
    messages = data.messages.reverse()
    messages.forEach (message) ->
      addMessage(message, {prepend: true})

    if data.end_of_history
      $('#load_old_messages').remove()
    else
      $('#load_old_messages').show()

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

  $('#load_old_messages a').click ->
    server.emit('load_old_messages')
    return false

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
        $messages = $("#chat li.message-ctr").first().find('.messages')
      else
        $messages = $("#chat li.message-ctr").last().find('.messages')
    else
      # create new user message container
      $msg_container = $("<li class='message-ctr'><div class='name'>#{data.name}</div><div class='messages'></div></li>")
      $msg_container.addClass('status') if data.status
      $msg_container.addClass('me') if data.user_id == server.socket.sessionid
      if opts['prepend']
        if $("#load_old_messages").length > 0
          $msg_container.insertAfter($("#load_old_messages"))
        else
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

    $chat.scrollTop $chat[0].scrollHeight if opts['scroll']