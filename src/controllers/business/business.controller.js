const BotController = require('../bot/bot.controller')

class BusinessController {
  constructor({ ipc, conversationSelector, messageTemplates }) {

    this.ipc = ipc
    this.conversationSelector = conversationSelector
    this.messageTemplates = messageTemplates

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
            const flow = this.messageTemplates[0].flow
            const _messages = flow.map(flowMessage => {
              return flowMessage.message.replace('{{1}}', messageModel.message)
            })
            
            this.bot.sendMessage(chat.id, _messages)
          })
        })
      }
    }, 1000)
  }
}

module.exports = BusinessController