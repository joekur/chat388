redis = require "./redis"

class Message

Message.sendOldMessages = (user, last_ind) ->
  start_ind = last_ind - 9 # send 10 messages at a time
  end_of_history = false

  if (start_ind <= 0) 
    # reached end of chat history
    start_ind = 0
    end_of_history = true

  redis.lrange "messages", start_ind, last_ind, (err, messages) ->
    user.next_message_to_load = start_ind - 1

    # convert to JSON
    send_messages = []
    messages.forEach (msg) ->
      send_messages.push(JSON.parse(msg))

    # send to client
    user.client.emit('old_messages', {messages: send_messages, end_of_history: end_of_history})

module.exports = Message
