var addMessage, addUser, last_message_user_id, my_name, server;

server = io.connect('/');

my_name = null;

last_message_user_id = null;

server.on('connect', function(data) {
  my_name = Cookie.find('username');
  if (_.isEmpty(my_name)) {
    my_name = prompt("What is your name?");
    Cookie.create('username', my_name);
  }
  server.emit('join', my_name);
  return addUser({
    name: my_name
  });
});

server.on('join', function(data) {
  addUser(data);
  return addMessage({
    name: "",
    message: "" + data.name + " has joined the room",
    status: true
  });
});

server.on('in room', function(data) {
  return addUser(data);
});

server.on('message', function(data) {
  return addMessage(data);
});

server.on('old_messages', function(messages) {
  console.log(messages);
  return messages.forEach(function(message) {
    return addMessage(message, {
      prepend: true
    });
  });
});

server.on('disconnect', function(data) {
  var $user;
  $user = $("ul#users li[data-id=" + data.id + "]");
  $user.remove();
  return addMessage({
    name: "",
    message: "" + data.name + " has left the room.",
    status: true
  });
});

$('#chat_form').submit(function() {
  var $input, msg;
  $input = $('#message');
  msg = $input.val();
  if (msg === '') {
    return false;
  }
  $input.val('');
  server.emit('message', msg);
  addMessage({
    name: my_name,
    user_id: server.socket.sessionid,
    message: msg
  });
  return false;
});

addUser = function(data) {
  var $user;
  $user = $("<li data-id='" + data.id + "'></li>");
  $user.text(data.name);
  return $('ul#users').append($user);
};

addMessage = function(data, opts) {
  var $chat, $msg, $msg_container;
  opts || (opts = {});
  $chat = $("#chat");
  $msg = $("<div class='message'></div>");
  $msg.text(data.message);
  if (last_message_user_id === data.user_id) {
    $("#chat li").last().find('.messages').append($msg);
  } else {
    $msg_container = $("<li><div class='name'>" + data.name + "</div><div class='messages'></div></li>");
    if (opts['prepend']) {
      console.log('prepend');
      $msg_container.find('.messages').prepend($msg);
    } else {
      $msg_container.find('.messages').append($msg);
    }
    if (data.status) {
      $msg_container.addClass('status');
    }
    if (data.user_id === server.socket.sessionid) {
      $msg_container.addClass('me');
    }
    $chat.append($msg_container);
  }
  last_message_user_id = data.user_id;
  return $chat.scrollTop($chat[0].scrollHeight);
};
