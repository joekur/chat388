chai = require 'chai'
chai.should()

User = require '../lib/user'

describe 'User', ->
  describe 'User.add', ->
    it 'stores the user', ->
      User.add('1', {
        name: 'Joe'
      })
      User.get('1').name.should.equal 'Joe'

  describe '#next_message_to_add', ->
    it 'can be saved', ->
      user = new User({})
      user.next_message_to_add = 4
      user.next_message_to_add.should.equal 4

  describe '#to_json', ->
    it 'includes id and name', ->
      user = new User({id: '1', name: 'Joe'})
      hash = user.to_json()
      hash.id.should.equal '1'
      hash.name.should.equal 'Joe'
