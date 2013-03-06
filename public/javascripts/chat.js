(function() {
  var addMessage, addUser, server;

  server = io.connect('http://localhost:3000');

  server.on('connect', function(data) {
    var name;
    name = prompt("What is your name?");
    server.emit('join', name);
    return addUser({
      name: name
    });
  });

  server.on('join', function(data) {
    return addUser(data);
  });

  server.on('disconnect', function(data) {
    var $user;
    $user = $("ul#users li[data-id=" + data.id + "]");
    $user.remove();
    return addMessage({
      name: data.name,
      message: "has left the room."
    });
  });

  addUser = function(data) {
    return $('ul#users').append("<li data-id='" + data.id + "'>" + data.name + "</li>");
  };

  addMessage = function(data) {
    var $msg;
    $msg = "<li>" + data.name + ": " + data.message + "</li>";
    return $('ul#chat').append($msg);
  };

}).call(this);
