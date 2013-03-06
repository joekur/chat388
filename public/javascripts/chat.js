var addMessage, addUser, my_name, server;

server = io.connect('http://localhost:3000');

my_name = null;

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
    name: data.name,
    message: "has joined the room",
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
    name: data.name,
    message: "has left the room.",
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
  return $('ul#users').append("<li data-id='" + data.id + "'>" + data.name + "</li>");
};

addMessage = function(data) {
  var $msg;
  $msg = $("<li>" + data.name + ": " + data.message + "</li>");
  if (data.status) {
    $msg.addClass('status');
  }
  return $('ul#chat').append($msg);
};
