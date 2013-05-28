
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

if (process.env.NODE_ENV == 'production') {
  // configure for heroku

  io.configure(function() {
    io.set("transports", ["xhr-polling"]);
    io.set("polling duration", 10);
  });

  var redis = require("redis-url").connect(process.env.REDISTOGO_URL);

} else {
  var redis = require('redis').createClient();
}

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

    redis.llen("messages", function(err, chat_length) {
      var start_ind = chat_length - 10; // send 10 messages at a time
      if (start_ind < 0) { start_ind = 0; }

      redis.lrange("messages", start_ind, -1, function(err, messages) {
        clients[client.id]['next_message_to_load'] = start_ind - 1;

        var send_messages = [];
        messages.forEach(function(msg) {
          send_messages.push(JSON.parse(msg));
        });

        client.emit('old_messages', send_messages);
      });
    });
    
  });

  client.on('message', function(msg) {
    var user = clients[client.id];
    var data = {
      message: msg,
      name: user.name,
      user_id: user.id
    };
    redis.rpush("messages", JSON.stringify(data));
    client.broadcast.emit('message', data);
    console.log("New message from user " + user.name + ": " + msg);
  });

  client.on('load_old_messages', function() {
    
  });

  client.on('disconnect', function() {
    user = clients[client.id];
    client.broadcast.emit('disconnect', user);
    console.log("User " + user.name + " has left the room");
    delete clients[client.id];
  })

});