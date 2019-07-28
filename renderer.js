// More information on: https://gist.github.com/sjcotto/41ab50ed18dd25c05b96fb3b30876713
const ipc = require('electron').ipcRenderer
const conversationSelector = '._2UaNq'

console.log('rendered loaded')

// Check every second if app is ready to start
var isReadyInterval = setInterval(function () {
  let searchInputElements = document.querySelector('.app')

  // Is ready to works
  if (searchInputElements && searchInputElements.childElementCount > 0) {
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
    (function () {
      function getStore(modules) {
        let foundCount = 0;
        let neededObjects = [
          { id: "Store", conditions: (module) => (module.Chat && module.Msg) ? module : null },
          { id: "MediaCollection", conditions: (module) => (module.default && module.default.prototype && module.default.prototype.processFiles !== undefined) ? module.default : null },
          { id: "ChatClass", conditions: (module) => (module.default && module.default.prototype && module.default.prototype.Collection !== undefined && module.default.prototype.Collection === "Chat") ? module : null },
          { id: "MediaProcess", conditions: (module) => (module.BLOB) ? module : null },
          { id: "Wap", conditions: (module) => (module.createGroup) ? module : null },
          { id: "ServiceWorker", conditions: (module) => (module.default && module.default.killServiceWorker) ? module : null },
          { id: "State", conditions: (module) => (module.STATE && module.STREAM) ? module : null },
          { id: "WapDelete", conditions: (module) => (module.sendConversationDelete && module.sendConversationDelete.length == 2) ? module : null },
          { id: "Conn", conditions: (module) => (module.default && module.default.ref && module.default.refTTL) ? module.default : null },
          { id: "WapQuery", conditions: (module) => (module.queryExist) ? module : ((module.default && module.default.queryExist) ? module.default : null) },
          { id: "CryptoLib", conditions: (module) => (module.decryptE2EMedia) ? module : null },
          { id: "OpenChat", conditions: (module) => (module.default && module.default.prototype && module.default.prototype.openChat) ? module.default : null },
          { id: "UserConstructor", conditions: (module) => (module.default && module.default.prototype && module.default.prototype.isServer && module.default.prototype.isUser) ? module.default : null },
          { id: "SendTextMsgToChat", conditions: (module) => (module.sendTextMsgToChat) ? module.sendTextMsgToChat : null },
          { id: "SendSeen", conditions: (module) => (module.sendSeen) ? module.sendSeen : null }
        ];
        for (let idx in modules) {
          if ((typeof modules[idx] === "object") && (modules[idx] !== null)) {
            let first = Object.values(modules[idx])[0];
            if ((typeof first === "object") && (first.exports)) {
              for (let idx2 in modules[idx]) {
                let module = modules(idx2);
                if (!module) {
                  continue;
                }
                neededObjects.forEach((needObj) => {
                  if (!needObj.conditions || needObj.foundedModule)
                    return;
                  let neededModule = needObj.conditions(module);
                  if (neededModule !== null) {
                    foundCount++;
                    needObj.foundedModule = neededModule;
                  }
                });
                if (foundCount == neededObjects.length) {
                  break;
                }
              }

              let neededStore = neededObjects.find((needObj) => needObj.id === "Store");
              window.Store = neededStore.foundedModule ? neededStore.foundedModule : {};
              neededObjects.splice(neededObjects.indexOf(neededStore), 1);
              neededObjects.forEach((needObj) => {
                if (needObj.foundedModule) {
                  window.Store[needObj.id] = needObj.foundedModule;
                }
              });
              window.Store.ChatClass.default.prototype.sendMessage = function (e) {
                return window.Store.SendTextMsgToChat(this, ...arguments);
              }
              return window.Store;
            }
          }
        }
      }
      webpackJsonp([], { 'parasite': (x, y, z) => getStore(z) }, ['parasite']);
    })();
  }
}

// Useful to clean all unread conversations
function openAllConversations() {
  var conversations = document.querySelectorAll(conversationSelector)
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
  if (!node) { return }

  let clickEvent = document.createEvent('MouseEvents');
  clickEvent.initEvent(eventType, true, true);
  node.dispatchEvent(clickEvent);
}

function sendMessage(id, msgReceived) {
  if (!id) {
    return
  }

  let chatsModels = Store.Chat.models
  let contact = id
  const message = `Welcome to *Virtual capital of America*, at this moment I haven't a brain and my father is working hard to give me artificial intelligence, if you are interested on my services please visit https://www.virtualcapitalofamerica.com. Your message: " _${msgReceived}_ "`;

  sendPresenceAvailable()

  for (chatModel in chatsModels) {
    if (isNaN(chatModel)) {
      continue;
    }

    let chat = {}
    chat.contact = chatsModels[chatModel].__x_formattedTitle;
    chat.id = chatsModels[chatModel].__x_id._serialized;

    if (chat.id.search(contact) != -1 && chat.id.search('g.us') == -1) {
      // Clean unread message
      sendSeen(chatsModels[chatModel])
      openConversation(chat.contact)
      // Send the message
      chatsModels[chatModel].sendMessage(message);
      // Also works
      //Store.SendTextMsgToChat(chatsModels[chatModel], '<<MESSAGE>>')

      sendPresenceUnavailable()
      return true
    }
  }
}

function sendPresenceAvailable(params) {
  Store.WapQuery.sendPresenceAvailable()
}

function sendPresenceUnavailable(params) {
  Store.WapQuery.sendPresenceUnavailable()
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

function getChat(id, next) {
  id = typeof id == "string" ? id : id._serialized;
  const found = window.Store.Chat.get(id);
  if (next !== undefined) next(found);
  return found;
}

function sendSeen(chat, next) {
  Store.SendSeen(chat, false).then(function (data) {
    next(true);
  });
};

