const BotController = require('../bot/bot.controller')
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

  messageHandler({ chat, messageModel }) {
    let chatAction = {}
    const keyIncidence = this.chatActions.find(action => {
      return messageModel.message.toLocaleLowerCase().match(action.key.toLocaleLowerCase())
    })
    debugger
    if (keyIncidence) {
      chatAction = utilities.searchers.object.findObject(keyIncidence, 'id', this.chatActions)
    } else {
      chatAction = utilities.searchers.object.findObject('no-key', 'id', this.chatActions)
    }

    if (!chatAction) {
      console.log(`No exist flow for this message: ${messageModel.message}`)
      return
    }

    chatAction.flow.map(flowMessage => {
      flowMessage.message = flowMessage.message.replace('{{1}}', messageModel.message)
    })

    this.bot.sendMessage(chat.id, chatAction)
  }
}

module.exports = BusinessController