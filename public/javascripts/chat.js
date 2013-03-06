(function() {
  var server;

  server = io.connect('http://localhost:3000');

  server.on('connect', function(data) {
    var name;
    name = prompt("What is your name?");
    return server.emit('join', name);
  });

  server.on('join', function(name) {
    console.log(name);
    return $('ul#users').append("<li>" + name + "</li>");
  });

}).call(this);
