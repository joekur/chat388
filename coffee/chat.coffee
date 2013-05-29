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
    addMessage(data, {scroll: true})

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
    addMessage({name: my_name, user_id: server.socket.sessionid, message: msg}, {scroll: true})

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
    $msg = renderMsg(data.message)
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

    if opts['scroll']
      $chat.scrollTop $chat[0].scrollHeight 


  SPRITE_WIDTH = 25

  renderMsg = (text) ->
    # escape dangerous characters
    text = text.replace(/&/g, "&amp;")
               .replace(/</g, "&lt;")
               .replace(/>/g, "&gt;")
               .replace(/"/g, "&quot;")
               .replace(/'/g, "&#039;")

    # add links
    # URLs starting with http://, https://, or ftp://
    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim
    text = text.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>')

    # URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim
    text = text.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>')

    # Change email addresses to mailto:: links.
    replacePattern3 = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim
    text = text.replace(replacePattern3, '<a href="mailto:$1" target="_blank">$1</a>')


    # pokemon items
    for pokemon, i in POKEMONS
      sprite_row = parseInt(i / 25)
      sprite_col = i % 25
      icon = "<div class='smiley' style=\"background-position: -#{sprite_col*32}px -#{sprite_row*32}px\" title='#{pokemon}'></div>"
      text = text.replace("(#{pokemon})", icon)

    $result = $("<div class='message'></div>")
    $result.html(text)
