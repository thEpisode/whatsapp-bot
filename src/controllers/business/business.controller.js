const BotController = require('../bot/bot.controller')
const backend = require('../backend/backend.controller')()
const utilities = require('../../core/utilities.manager')()

class BusinessController {

  constructor({ ipc, conversationSelector, chatActions }) {
    this.ipc = ipc
    this.conversationSelector = conversationSelector
    this.chatActions = chatActions

    this.initializeEvents()
    this.createBot()
  }

  createBot() {
    this.bot = new BotController({
      ipc: this.ipc,
      conversationSelector: this.conversationSelector
    })
    this.bot.startEngine()
  }

  initializeEvents() {
    this.ipc.on('bot-ready', (event, args) => {
      console.log('Whatsapp loaded and bot')
      this.startListening()
    })
  }

  /**
   * Every second check if has any message unread, if is true return the same message
   */
  startListening() {
    setInterval(() => {
      let unreadChats = this.bot.getUnreadChats()

      if (unreadChats && unreadChats.length > 0) {
        unreadChats.map((chat) => {
          chat.messages.map((messageModel) => {
            this.messageHandler({ chat, messageModel })
          })
        })
      }
    }, 1000)
    console.log('Bot listening for incoming conversations')
  }

  async messageHandler({ chat, messageModel }) {
    let chatAction = {}
    const keyIncidence = this.chatActions.find(action => {
      if (messageModel.message.toLocaleLowerCase().match(action.key.toLocaleLowerCase())) {
        return true
      } else {
        return false
      }
    })

    if (keyIncidence) {
      chatAction = utilities.searchers.object.findObject(keyIncidence.id, 'id', this.chatActions)
    } else {
      chatAction = utilities.searchers.object.findObject('no-key', 'id', this.chatActions)
    }

    if (!chatAction) {
      console.log(`No exist flow for this message: ${messageModel.message}`)
      return
    }

    if (chatAction.services && chatAction.services.preflight) {
      const response = await backend.request({
        route: chatAction.services.preflight.route,
        method: chatAction.services.preflight.method,
        parameters: { chat, messageModel }
      })
      
      if (!utilities.response.isValid(response)) {
        chatAction.flow = [{ message: response.message }]
      }
    }

    chatAction.flow.map(flowMessage => {
      flowMessage.message = flowMessage.message.replace('{{INCOMING_MESSAGE}}', messageModel.message)
      flowMessage.message = flowMessage.message.replace('{{INCOMING_PHONE}}', chat.user)
    })

    this.bot.sendMessage(chat.id, chatAction)
  }
}

module.exports = BusinessController