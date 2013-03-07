var addMessage, addUser, last_message_user_id, my_name, server;

server = io.connect('/');

my_name = null;

last_message_user_id = null;

server.on('connect', function(data) {
  my_name = prompt("What is your name?");
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

addMessage = function(data) {
  var $msg, $msg_container;
  $msg = $("<div class='message'></div>");
  $msg.text(data.message);
  if (last_message_user_id === data.user_id) {
    $("#chat li").last().find('.messages').append($msg);
  } else {
    $msg_container = $("<li><div class='name'>" + data.name + "</div><div class='messages'></div></li>");
    $msg_container.find('.messages').append($msg);
    if (data.status) {
      $msg_container.addClass('status');
    }
    if (data.user_id === server.socket.sessionid) {
      $msg_container.addClass('me');
    }
    $('ul#chat').append($msg_container);
  }
  return last_message_user_id = data.user_id;
};
