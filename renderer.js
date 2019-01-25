// More information on: https://gist.github.com/sjcotto/41ab50ed18dd25c05b96fb3b30876713

console.log('rendered loaded')
var ipc = require('electron').ipcRenderer

var finderInterval = setInterval(function () {
  var finderConversation = document.querySelectorAll('.jN-F5')
  if (finderConversation.length > 0) {
    clearInterval(finderInterval)
    start()
  }
}, 1000)

function start() {
  ipc.send('user-data', { userId: '', message: 'Pruebilla' })
}

ipc.on('setup-bridge', function (event, arg) {
  parseAppObject()
  //openAllConversations()

  ipc.send('setup-finished')
})

ipc.on('send-message', function (event, arg) {
  sendMessage(arg.userId, arg.message)
})

ipc.on('start-echo', function (event, args) {
  setInterval(() => {
    let unread = getUnreadChats()

    if (unread && unread.length > 0) {
      unread.map((chat) => {
        chat.messages.map((message) => {
          sendMessage(chat.id, message.message)
        })
      })
    }
  }, 1000)
})

function parseAppObject(params) {
  if (window.Store === undefined) {
    webpackJsonp([], { "bcihgfbdeb": (x, y, z) => window.Store = z('"bcihgfbdeb"') }, "bcihgfbdeb");
    webpackJsonp([], { "cbagcefdge": (x, y, z) => window.Store.Wap = z('"cbagcefdge"') }, "cbagcefdge");
  }
}

function openAllConversations() {
  var conversations = document.querySelectorAll('._2wP_Y>div>div')
  conversations.forEach((conversation) => {
    triggerMouseEvent(conversation, "mouseover");
    triggerMouseEvent(conversation, "mousedown");
    triggerMouseEvent(conversation, "mouseup");
    triggerMouseEvent(conversation, "click");
  });
}

function openConversation(name) {
  var conversation = document.querySelector(`span[title="${name}"]`)
  triggerMouseEvent(conversation, "mouseover");
  triggerMouseEvent(conversation, "mousedown");
  triggerMouseEvent(conversation, "mouseup");
  triggerMouseEvent(conversation, "click");
}

function triggerMouseEvent(node, eventType) {
  var clickEvent = document.createEvent('MouseEvents');
  clickEvent.initEvent(eventType, true, true);
  node.dispatchEvent(clickEvent);
}

function sendMessage(id, msgReceived) {
  if (!id) {
    return
  }

  var Chats = Store.Chat.models
  var contact = id;
  var message = `Welcome to *Virtual capital of America*, at this moment I haven't a brain and my father is working hard to give me artificial intelligence, if you are interested on my services please visit https://www.virtualcapitalofamerica.com. Your message: " _${msgReceived}_ "`;
  for (chat in Chats) {
    if (isNaN(chat)) {
      continue;
    }

    var temp = {};
    temp.contact = Chats[chat].__x__formattedTitle;
    temp.id = Chats[chat].__x_id._serialized;
    if (temp.id.search(contact) != -1 && temp.id.search('g.us') == -1) {
      Chats[chat].sendSeen(1)
      Chats[chat].sendMessage(message);
      return true
    }
  }
}

function isChatMessage(message) {
  if (message.__x_isSentByMe) {
    return false;
  }
  if (message.__x_isNotification) {
    return false;
  }
  if (!message.__x_isUserCreatedType) {
    return false;
  }
  return true;
}
function getUnreadChats() {
  var Chats = Store.Chat.models;
  var Output = [];

  for (chat in Chats) {
    if (isNaN(chat)) {
      continue;
    };
    var unreadMessage = {};
    unreadMessage.contact = Chats[chat].__x_formattedTitle;
    unreadMessage.id = Chats[chat].__x_id._serialized;
    unreadMessage.messages = [];
    var messages = Chats[chat].msgs.models;
    for (var i = messages.length - 1; i >= 0; i--) {
      if (!messages[i].__x_isNewMsg) {
        break;
      } else {
        if (!isChatMessage(messages[i])) {
          continue
        }
        messages[i].__x_isNewMsg = false;
        unreadMessage.messages.push({
          message: messages[i].__x_body,
          timestamp: messages[i].__x_t,
          type: messages[i].__x_type,
          e: messages[i]
        });
      }
    }
    if (unreadMessage.messages.length > 0) {
      Output.push(unreadMessage);
    }
  }
  //console.log("Unread messages: ", Output);
  return Output;
}
