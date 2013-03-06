
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

var users = [];

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
    force: true
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
  users.forEach(function(user) {
    client.emit('join', user);
  })

  client.on('join', function(name) {
    users.push(name);
    client.broadcast.emit('join', name);
    client.set('name', name);
    console.log("User " + name + " has joined the room");
  });

});