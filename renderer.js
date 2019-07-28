const ipc = require('electron').ipcRenderer
const conversationSelector = '._2UaNq'

let messageTemplate = `Welcome to *Virtual capital of America*, at this moment I haven't a brain and my father is working hard to give me artificial intelligence, if you are interested on my services please visit https://www.virtualcapitalofamerica.com. Your message: " _{{1}}_ "`;
let bot = {}

console.log('rendered loaded')

class Bot {
  constructor({ messageTemplate, conversationSelector }) {
    this.messageTemplate = messageTemplate
    this.conversationSelector = conversationSelector

    // If Whatsapp app is not parsed to use outside from sandbox
    this.parseAppObject()
  }

  startEngine() {
    this.whatsappValidator()
  }

  whatsappValidator() {
    // Check every second if app is ready to start
    var isReadyInterval = setInterval(() => {
      let searchInputElements = document.querySelector('.app')

      // Is ready to works
      if (searchInputElements && searchInputElements.childElementCount > 0) {
        clearInterval(isReadyInterval)
        this.whatsappIsReady()
      }
    }, 1000)
  }

  timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  random(from, to) {
    return Math.floor(Math.random() * to) + from;
  }

  // Send a message to main.js notifying is ready to use
  whatsappIsReady() {
    ipc.send('whatsapp-is-ready')
  }

  // Expose Whatsapp app to window
  parseAppObject(params) {
    if (window.Store !== undefined) {
      return
    }

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
    })()
  }

  // Useful to clean all unread conversations
  openAllConversations() {
    var conversations = document.querySelectorAll(conversationSelector)
    conversations.forEach((conversation) => {
      this.triggerMouseEvent(conversation, "mouseover");
      this.triggerMouseEvent(conversation, "mousedown");
      this.triggerMouseEvent(conversation, "mouseup");
      this.triggerMouseEvent(conversation, "click");
    });
  }

  // Maybe to get links or history
  openConversation(name) {
    let conversation = document.querySelector(`span[title="${name}"]`)

    // "Human" behavior
    this.triggerMouseEvent(conversation, "mouseover");
    this.triggerMouseEvent(conversation, "mousedown");
    this.triggerMouseEvent(conversation, "mouseup");
    this.triggerMouseEvent(conversation, "click");
  }

  // Simulate a mouse event
  triggerMouseEvent(node, eventType) {
    if (!node) { return }

    let clickEvent = document.createEvent('MouseEvents');
    clickEvent.initEvent(eventType, true, true);
    node.dispatchEvent(clickEvent);
  }

  async sendMessage(id, msgReceived) {
    if (!id) {
      return
    }

    const chatsModels = Store.Chat.models

    this.sendPresenceAvailable()

    let chatModel = chatsModels.find(chat => {
      return chat.__x_id._serialized.search(id) >= 0 && chat.__x_id._serialized.search('g.us') === -1
    })

    if (!chatModel) { return }

    let chat = {}
    chat.contact = chatModel.__x_formattedTitle;
    chat.id = chatModel.__x_id._serialized;

    const _message = messageTemplate.replace('{{1}}', msgReceived)

    // Clean coming message
    await this.timeout(this.random(300, 1000))
    this.openConversation(chat.contact)
    this.sendChatStateSeen(chatModel)

    // Send to conversation "typing..." state
    await this.timeout(this.random(800, 2000));
    this.sendChatstateComposing(chat.id)

    // Send the message
    await this.timeout(this.random(500, _message.length * 80));
    //chatModel.sendMessage(message);
    // Also works
    Store.SendTextMsgToChat(chatModel, _message)

    // Stop the sending of conversation "typing..." state
    this.sendChatstatePaused(chat.id)

    // Set offline state
    await this.timeout(this.random(300, 850));
    this.sendPresenceUnavailable()
  }

  sendChatstateComposing(chatIdSerialized) {
    Store.WapQuery.sendChatstateComposing(chatIdSerialized)
  }

  sendChatstatePaused(chatIdSerialized) {
    Store.WapQuery.sendChatstateComposing(chatIdSerialized)
  }

  sendPresenceAvailable() {
    Store.WapQuery.sendPresenceAvailable()
  }

  sendPresenceUnavailable() {
    Store.WapQuery.sendPresenceUnavailable()
  }

  // Verify if is a message
  isChatMessage(message) {
    if (message.__x_isSentByMe) {
      return false
    }
    if (message.__x_isNotification) {
      return false
    }
    if (!message.__x_isUserCreatedType) {
      return false
    }
    return true
  }

  getUnreadChats() {
    const chats = Store.Chat.models
    let output = []

    for (const chat in chats) {
      if (isNaN(chat)) {
        continue
      }

      let messages = chats[chat].msgs.models
      let unreadMessage = {}
      unreadMessage.contact = chats[chat].__x_formattedTitle || ''
      unreadMessage.id = chats[chat].__x_id._serialized || ''
      unreadMessage.messages = []

      for (let i = messages.length - 1; i >= 0; i--) {
        if (!messages[i].__x_isNewMsg) {
          break
        } else {
          if (!this.isChatMessage(messages[i])) {
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
        output.push(unreadMessage);
      }
    }

    return output;
  }

  getChat(id, next) {
    id = typeof id == "string" ? id : id._serialized
    const found = window.Store.Chat.get(id)

    if (next !== undefined) { next(found) }

    return found
  }

  sendChatStateSeen(chat, next) {
    Store.SendSeen(chat, true).then(() => {
      next(true)
    })
  }
}

// Useful to send a message from backend
/* ipc.on('send-message', function (event, args) {
  sendMessage(args.userId, args.message)
}) */

// Every second check if has any message unread, if is true return the same message
ipc.on('start-echo', function (event, args) {
  setInterval(() => {
    let unreadChats = bot.getUnreadChats()

    if (unreadChats && unreadChats.length > 0) {
      unreadChats.map((chat) => {
        chat.messages.map((message) => {
          bot.sendMessage(chat.id, message.message)
        })
      })
    }
  }, 1000)
})

ipc.on('initialize-bot', (event, args) => {
  bot = new Bot(messageTemplate, conversationSelector)
  bot.startEngine()
})

