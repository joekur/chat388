
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , coffeescript = require('connect-coffee-script')
  , socket = require('socket.io');

var app = express();
var server = http.createServer(app);
var io = socket.listen(server);

var clients = {};

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(coffeescript({
    src: __dirname + '/coffee',
    dest: __dirname + '/public/javascripts',
    prefix: '/javascripts/',
    force: true,
    bare: true
  }))
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

io.sockets.on('connection', function(client) {

  // send all current users
  for(var id in clients) {
    client.emit('in room', clients[id]);
  }

  client.on('join', function(name) {
    var user_joined = {
      name: name,
      id: client.id
    };
    clients[client.id] = user_joined;
    client.broadcast.emit('join', user_joined);
    console.log("User " + name + " has joined the room");
  });

  client.on('message', function(msg) {
    var user = clients[client.id];
    client.broadcast.emit('message', {
      message: msg,
      name: user.name,
      user_id: user.id
    })
    console.log("New message from user " + user.name + ": " + msg);
  });

  client.on('disconnect', function() {
    user = clients[client.id];
    client.broadcast.emit('disconnect', user);
    console.log("User " + user.name + " has left the room");
    delete clients[client.id];
  })

});