(function() {
  var addUser, server;

  server = io.connect('http://localhost:3000');

  server.on('connect', function(data) {
    var name;
    name = prompt("What is your name?");
    server.emit('join', name);
    return addUser(name);
  });

  server.on('join', function(name) {
    return addUser(name);
  });

  addUser = function(name) {
    return $('ul#users').append("<li>" + name + "</li>");
  };

}).call(this);
