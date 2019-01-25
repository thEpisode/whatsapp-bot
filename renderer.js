// More information on: https://gist.github.com/sjcotto/41ab50ed18dd25c05b96fb3b30876713
const ipc = require('electron').ipcRenderer

console.log('rendered loaded')

// Check every second if app is ready to start
var isReadyInterval = setInterval(function () {
  let searchInputElements = document.querySelectorAll('.jN-F5')

  // Is ready to works
  if (searchInputElements.length > 0) {
    clearInterval(isReadyInterval)
    start()
  }
}, 1000)

// Send a message to main.js notifying is ready to use
function start() {
  ipc.send('whatsapp-is-ready')
}

// Setting up initial code to start bot
ipc.on('setup-bridge', function (event, arg) {
  // If Whatsapp app is not parsed to use outside from sandbox
  parseAppObject()
  //openAllConversations()

  ipc.send('setup-finished')
})

// Useful to send a message from backend
ipc.on('send-message', function (event, arg) {
  sendMessage(arg.userId, arg.message)
})

// Every second check if has any message unread, if is true return the same message
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

// Expose Whatsapp app to window
function parseAppObject(params) {
  if (window.Store === undefined) {
    webpackJsonp([], { "bcihgfbdeb": (x, y, z) => window.Store = z('"bcihgfbdeb"') }, "bcihgfbdeb");
    webpackJsonp([], { "cbagcefdge": (x, y, z) => window.Store.Wap = z('"cbagcefdge"') }, "cbagcefdge");
  }
}

// Useful to clean all unread conversations
function openAllConversations() {
  var conversations = document.querySelectorAll('._2wP_Y>div>div')
  conversations.forEach((conversation) => {
    triggerMouseEvent(conversation, "mouseover");
    triggerMouseEvent(conversation, "mousedown");
    triggerMouseEvent(conversation, "mouseup");
    triggerMouseEvent(conversation, "click");
  });
}

// Maybe to get links or history
function openConversation(name) {
  let conversation = document.querySelector(`span[title="${name}"]`)

  // "Human" behavior
  triggerMouseEvent(conversation, "mouseover");
  triggerMouseEvent(conversation, "mousedown");
  triggerMouseEvent(conversation, "mouseup");
  triggerMouseEvent(conversation, "click");
}

// Simulate a mouse event
function triggerMouseEvent(node, eventType) {
  let clickEvent = document.createEvent('MouseEvents');
  clickEvent.initEvent(eventType, true, true);
  node.dispatchEvent(clickEvent);
}

function sendMessage(id, msgReceived) {
  if (!id) {
    return
  }

  let Chats = Store.Chat.models
  let contact = id
  const message = `Welcome to *Virtual capital of America*, at this moment I haven't a brain and my father is working hard to give me artificial intelligence, if you are interested on my services please visit https://www.virtualcapitalofamerica.com. Your message: " _${msgReceived}_ "`;
  for (chat in Chats) {
    if (isNaN(chat)) {
      continue;
    }

    var temp = {}
    temp.contact = Chats[chat].__x__formattedTitle;
    temp.id = Chats[chat].__x_id._serialized;
    if (temp.id.search(contact) != -1 && temp.id.search('g.us') == -1) {
      // Clean unread message
      Chats[chat].sendSeen(1)
      // Send the message
      Chats[chat].sendMessage(message);
      return true
    }
  }
}

// Verify if is a message
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
  let Chats = Store.Chat.models;
  let Output = [];

  for (chat in Chats) {
    if (isNaN(chat)) {
      continue;
    };
    
    let messages = Chats[chat].msgs.models
    let unreadMessage = {}
    unreadMessage.contact = Chats[chat].__x_formattedTitle || ''
    unreadMessage.id = Chats[chat].__x_id._serialized || ''
    unreadMessage.messages = []

    for (let i = messages.length - 1; i >= 0; i--) {
      if (!messages[i].__x_isNewMsg) {
        break
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
        })
      }
    }
    if (unreadMessage.messages.length > 0) {
      Output.push(unreadMessage);
    }
  }

  return Output;
}
