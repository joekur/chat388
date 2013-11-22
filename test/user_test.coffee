test = require './test_helper'

client = test.Factory.newClient()

User = require '../lib/user'

describe 'User', ->
  describe 'User.add', ->
    it 'stores the user', ->
      User.add(client, {
        name: 'Joe'
      })
      User.get(client.id).name.should.equal 'Joe'

  describe '#next_message_to_add', ->
    it 'can be saved', ->
      user = new User(client, {})
      user.next_message_to_add = 4
      user.next_message_to_add.should.equal 4

  describe '#to_json', ->
    it 'includes id and name', ->
      user = new User(client, {id: '1', name: 'Joe'})
      hash = user.to_json()
      hash.id.should.equal '1'
      hash.name.should.equal 'Joe'
