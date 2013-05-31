
jQuery(function() {
  var SPRITE_WIDTH, addMessage, addUser, first_message_user_id, last_message_user_id, my_name, renderMsg, server, unread_messages, updateTitleStatus;
  server = io.connect('/');
  my_name = null;
  last_message_user_id = null;
  first_message_user_id = null;
  window.active = true;
  unread_messages = 0;
  server.on('connect', function(data) {
    my_name = Cookie.find('username');
    if (_.isEmpty(my_name)) {
      my_name = prompt("What is your name?");
      Cookie.create('username', my_name);
    }
    server.emit('join', my_name);
    $("#username").text("Chatting as: " + my_name);
    return addUser({
      name: my_name
    });
  });
  server.on('join', function(data) {
    addUser(data);
    return addMessage({
      name: "",
      message: "" + data.name + " has joined the room",
      status: true
    });
  });
  server.on('in room', function(data) {
    return addUser(data);
  });
  server.on('message', function(data) {
    addMessage(data, {
      scroll: true
    });
    if (!window.active) {
      unread_messages += 1;
    }
    return updateTitleStatus();
  });
  server.on('old_messages', function(data) {
    var messages;
    messages = data.messages.reverse();
    messages.forEach(function(message) {
      return addMessage(message, {
        prepend: true
      });
    });
    if (data.end_of_history) {
      return $('#load_old_messages').remove();
    } else {
      return $('#load_old_messages').show();
    }
  });
  server.on('disconnect', function(data) {
    var $user;
    $user = $("ul#users li[data-id=" + data.id + "]");
    $user.remove();
    return addMessage({
      name: "",
      message: "" + data.name + " has left the room.",
      status: true
    });
  });
  $('#chat_form').submit(function() {
    var $input, msg;
    $input = $('#message');
    msg = $input.val();
    if (msg === '') {
      return false;
    }
    $input.val('');
    server.emit('message', msg);
    addMessage({
      name: my_name,
      user_id: server.socket.sessionid,
      message: msg
    }, {
      scroll: true
    });
    return false;
  });
  $('#load_old_messages a').click(function() {
    server.emit('load_old_messages');
    return false;
  });
  $(window).focus(function() {
    window.active = true;
    unread_messages = 0;
    return updateTitleStatus();
  });
  $(window).blur(function() {
    return window.active = false;
  });
  updateTitleStatus = function() {
    var title;
    title = "Chat 388";
    if (unread_messages > 0) {
      title += " (" + unread_messages + ")";
    }
    return document.title = title;
  };
  addUser = function(data) {
    var $user;
    $user = $("<li data-id='" + data.id + "'></li>");
    $user.text(data.name);
    return $('ul#users').append($user);
  };
  addMessage = function(data, opts) {
    var $chat, $messages, $msg, $msg_container, add_to_ctr;
    opts || (opts = {});
    $chat = $("#chat");
    $msg = renderMsg(data.message);
    add_to_ctr = opts['prepend'] ? first_message_user_id === data.user_id : last_message_user_id === data.user_id;
    if (add_to_ctr) {
      if (opts['prepend']) {
        $messages = $("#chat li.message-ctr").first().find('.messages');
      } else {
        $messages = $("#chat li.message-ctr").last().find('.messages');
      }
    } else {
      $msg_container = $("<li class='message-ctr'><div class='name'>" + data.name + "</div><div class='messages'></div></li>");
      if (data.status) {
        $msg_container.addClass('status');
      }
      if (data.user_id === server.socket.sessionid) {
        $msg_container.addClass('me');
      }
      if (opts['prepend']) {
        if ($("#load_old_messages").length > 0) {
          $msg_container.insertAfter($("#load_old_messages"));
        } else {
          $chat.prepend($msg_container);
        }
      } else {
        $chat.append($msg_container);
      }
      $messages = $msg_container.find('.messages');
    }
    if (opts['prepend']) {
      first_message_user_id = data.user_id;
      $messages.prepend($msg);
    } else {
      last_message_user_id = data.user_id;
      $messages.append($msg);
    }
    if (opts['scroll']) {
      return $chat.scrollTop($chat[0].scrollHeight);
    }
  };
  SPRITE_WIDTH = 25;
  return renderMsg = function(text) {
    var $result, i, icon, imagePattern, pokemon, replacePattern1, replacePattern2, replacePattern3, sprite_col, sprite_row, src, videoPattern, _i, _len;
    text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    imagePattern = /(^(https?:\/\/|www\.)[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|](\.gif|\.png|\.jpg|\.jpeg|\.bmp)$)/i;
    videoPattern = /(http:\/\/|www.|http:\/\/www.)youtube.com\/watch\?v\=(.+)/;
    if (text.match(imagePattern)) {
      text = "<img src='" + RegExp.$1 + "' title='" + RegExp.$1 + "' />";
    } else if (text.match(videoPattern)) {
      src = "https://www.youtube.com/embed/" + RegExp.$2;
      text = "<iframe src='" + src + "' class='video youtube' frameborder='0' webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>";
    } else {
      replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
      text = text.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');
      replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
      text = text.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');
      replacePattern3 = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
      text = text.replace(replacePattern3, '<a href="mailto:$1" target="_blank">$1</a>');
      for (i = _i = 0, _len = POKEMONS.length; _i < _len; i = ++_i) {
        pokemon = POKEMONS[i];
        sprite_row = parseInt(i / 25);
        sprite_col = i % 25;
        icon = "<div class='smiley' style=\"background-position: -" + (sprite_col * 32) + "px -" + (sprite_row * 32) + "px\" title='" + pokemon + "'></div>";
        text = text.replace("(" + pokemon + ")", icon);
      }
    }
    $result = $("<div class='message'></div>");
    return $result.html(text);
  };
});
