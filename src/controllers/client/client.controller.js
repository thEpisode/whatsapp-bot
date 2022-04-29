const { Client, LocalAuth, List, Buttons } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')

class ClientController {
  constructor (dependencies, { bots }) {
    this._dependencies = dependencies
    this._config = this._dependencies.config
    this._console = this._dependencies.console
    this._controllers = this._dependencies.controllers
    this._bots = bots

    this.nextChatActionId = null
    this.conversations = []
  }

  /**
   * Initial point process
   */
  async startEngine () {
    await this.startSession()
  }

  async startSession () {
    this._waClient = new Client()

    this.defineEvents()

    this._waClient.initialize()
  }

  /**
   * Define all WhatsApp events
   */
  async defineEvents () {
    this._waClient.on('qr', (qr) => {
      this._console.info('QR Received')
      qrcode.generate(qr, { small: true })
    })

    this._waClient.on('ready', () => {
      this._console.info('Client is ready!')
    })

    this._waClient.on('message', async (message) => {
      try {
        const chat = await message.getChat()

        switch (message.body) {
          case '!ping':
            message.reply('pong')
            break
          case '!buttons':
            let buttons = new Buttons("Button body", [{ body: "bt1" }, { body: "bt2" }, { body: "bt3" }], "title", "footer")
            chat.sendMessage('Sending buttons')
            chat.sendMessage(buttons)
            break
          case '!list':
            let sections = [{ title: 'sectionTitle', rows: [{ id: 'customId', title: 'ListItem1', description: 'desc' }, { title: 'ListItem2' }] }]
            let list = new List('aaa', 'btnText', sections, 'Title', 'footer')
            chat.sendMessage('Sending list')
            chat.sendMessage(list)
            break
          default:
            const action = await this.digestIncomingMessage(message, chat)

            this.sendActionMessages(chat, action)
            break
        }
      } catch (error) {
        this._console.error(error)
        console.log(error.stack)
      }
    })
  }

  /**
   * Find if exist current conversation in memory to prevent memory misuse
   * @param {Object} chat 
   * @returns Conversation or null if not exist en memory
   */
  findConversationInMemory (chat) {
    for (const conversation of this.conversations) {
      if (conversation.chat.id._serialized === chat.id._serialized) {
        return conversation
      }
    }

    return null
  }

  /**
   * Receive and process the incoming message
   * @param {Object} message Is the incoming message with all metadata from whatsapp
   * @param {Object} chat Is the related chat of incoming message
   * @returns Action, in other words, what need to response to incoming message
   */
  digestIncomingMessage (message, chat) {
    try {
      let conversation = this.findConversationInMemory(chat)

      if (conversation === null) {
        conversation = new this._controllers.ConversationController(
          this._dependencies,
          {
            bots: this._bots,
            chat
          }
        )
        this.conversations.push(conversation)
      }

      return conversation.processMessage({ message })
    } catch (error) {
      this._console.error(error)
      console.log(error.stack)
    }
  }

  /**
   * Send a simple message to desired chat
   * @param {Object} chat Is the related chat of incoming message
   * @param {Object} action Is the action related to incoming message
   */
  sendActionMessages (chat, action) {
    try {
      // Send all messages in action
      for (const message of action.get.messages) {
        chat.sendMessage(message.body)
      }
    } catch (error) {
      this._console.error(error)
      console.log(error.stack)
    }
  }
}

module.exports = ClientController