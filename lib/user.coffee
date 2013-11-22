redis = require "./redis"
Message = require "./message"

user_store = {}

class User

  constructor: (client, params) ->
    @client = client
    @id = params.id
    @name = params.name
    @next_message_to_add = null

  to_json: ->
    {
      id: @id
      name: @name
    }

  disconnect: ->
    @client.broadcast.emit "disconnect", user
    console.log "User " + user.name + " has left the room"
    delete clients[@id]

User.get = (id) ->
  user_store[id]

User.add = (client, params) ->
  params.id = client.id
  user_store[client.id] = new User(client, params)

User.joinRoom = (client, name) ->
  user = User.add(client, {
    name: name
    id: client.id
  })

  client.broadcast.emit "join", user.to_json()

  redis.llen "messages", (err, chat_length) ->
    Message.sendOldMessages user, chat_length - 1

  user

User.whosInRoom = ->
  user_store


module.exports = User
