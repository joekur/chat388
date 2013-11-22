###
Module dependencies.
###

express      = require "express"
routes       = require "./routes"
http         = require "http"
path         = require "path"
coffeescript = require "connect-coffee-script"
socket       = require "socket.io"
redis        = require "./lib/redis"
Message      = require "./lib/message"
User         = require "./lib/user"

app = express()
server = http.createServer(app)
io = socket.listen(server)

if process.env.NODE_ENV is "production"
  # configure for heroku
  io.configure ->
    io.set "transports", ["xhr-polling"]
    io.set "polling duration", 10

clients = {}

app.configure ->
  app.set "port", process.env.PORT or 3001
  app.set "views", __dirname + "/views"
  app.set "view engine", "jade"
  app.use express.favicon()
  app.use express.logger("dev")
  app.use express.bodyParser()
  app.use express.methodOverride()
  app.use app.router
  app.use require("less-middleware")(src: __dirname + "/public")
  app.use coffeescript(
    src: __dirname + "/client"
    dest: __dirname + "/public/javascripts"
    prefix: "/javascripts/"
    force: true
    bare: true
  )
  app.use express.static(path.join(__dirname, "public"))
  app.use express.cookieParser()
  app.use express.session(secret: "faslk2lknr2lkrn")

app.configure "development", ->
  app.use express.errorHandler()

app.get "/", routes.index

server.listen app.get("port"), ->
  console.log "Express server listening on port " + app.get("port")

io.sockets.on "connection", (client) ->

  client.on "join", (name) ->
    user = User.joinRoom(client, name)
    console.log "User #{user.name} (#{user.id}) has joined the room"

    # send all current users
    for id, user of User.whosInRoom()
      client.emit "in room", user.to_json()

  client.on "message", (msg) ->
    user = User.get(client.id)
    data = {
      message: msg
      name: user.name
      user_id: user.id
    }

    redis.rpush "messages", JSON.stringify(data)
    client.broadcast.emit "message", data
    console.log "New message from user " + user.name + ": " + msg

  client.on "load_old_messages", ->
    user = User.get(client.id)
    next_message_to_load = user.next_message_to_load
    return if next_message_to_load < 0
    Message.sendOldMessages user, next_message_to_load

  client.on "disconnect", ->
    user = User.get(client.id)
    user.disconnect()
