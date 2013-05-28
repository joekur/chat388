var addMessage, addUser, first_message_user_id, last_message_user_id, my_name, server;

server = io.connect('/');

my_name = null;

last_message_user_id = null;

first_message_user_id = null;

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

server.on('old_messages', function(data) {
  var messages;
  messages = data.messages.reverse();
  messages.forEach(function(message) {
    return addMessage(message, {
      prepend: true
    });
  });
  if (data.end_of_history) {
    return $('#load_old_messages').remove();
  }
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

$('#load_old_messages a').click(function() {
  server.emit('load_old_messages');
  return false;
});

addUser = function(data) {
  var $user;
  $user = $("<li data-id='" + data.id + "'></li>");
  $user.text(data.name);
  return $('ul#users').append($user);
};

addMessage = function(data, opts) {
  var $chat, $messages, $msg, $msg_container, add_to_ctr;
  opts || (opts = {});
  $chat = $("#chat");
  $msg = $("<div class='message'></div>");
  $msg.text(data.message);
  add_to_ctr = opts['prepend'] ? first_message_user_id === data.user_id : last_message_user_id === data.user_id;
  if (add_to_ctr) {
    if (opts['prepend']) {
      $messages = $("#chat li.message-ctr").first().find('.messages');
    } else {
      $messages = $("#chat li.message-ctr").last().find('.messages');
    }
  } else {
    $msg_container = $("<li class='message-ctr'><div class='name'>" + data.name + "</div><div class='messages'></div></li>");
    if (data.status) {
      $msg_container.addClass('status');
    }
    if (data.user_id === server.socket.sessionid) {
      $msg_container.addClass('me');
    }
    if (opts['prepend']) {
      if ($("#load_old_messages").length > 0) {
        $msg_container.insertAfter($("#load_old_messages"));
      } else {
        $chat.prepend($msg_container);
      }
    } else {
      $chat.append($msg_container);
    }
    $messages = $msg_container.find('.messages');
  }
  if (opts['prepend']) {
    first_message_user_id = data.user_id;
    $messages.prepend($msg);
  } else {
    last_message_user_id = data.user_id;
    $messages.append($msg);
  }
  return $chat.scrollTop($chat[0].scrollHeight);
};
