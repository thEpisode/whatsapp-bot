const { Client, MessageMedia, List, Buttons } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')

class ClientController {
  constructor (dependencies) {
    this._dependencies = dependencies
    this._config = this._dependencies.config
    this._console = this._dependencies.console
    this._controllers = this._dependencies.controllers
    this._appController = null
    this._bots = null

    this.nextChatActionId = null
    this.conversations = []
  }

  /**
   * Initial point process
   */
  async startEngine ({ data }) {
    await this.startSession({ user: data.user })
  }

  async startSession ({ user }) {
    if (!user) {
      throw new Error('Required user data to process this message')
    }

    // Load apps
    this._appController = new this._controllers.AppController(this._dependencies)

    // Setup apps
    this._appController.loadApps({ apps: user.apps })
    this._dependencies.apps = this._appController

    this._bots = this.#getBotsByUserId({ user })

    // Load WhatsApp client
    this._whatsappClient = new Client()

    // Setup Whatsapp Client
    this.defineEvents()
    this._whatsappClient.initialize()
  }

  #getBotsByUserId ({ user }) {
    return user.bots
  }

  /**
   * Define all WhatsApp events
   */
  async defineEvents () {
    this._whatsappClient.on('qr', (qr) => {
      this._console.info('QR Received')
      qrcode.generate(qr, { small: true })
    })

    this._whatsappClient.on('ready', () => {
      this._console.info('Client is ready!')
    })

    this._whatsappClient.on('message', async (message) => {
      try {
        const chat = await message.getChat()

        switch (message.body) {
          case '!ping':
            this.handleTestPingMessage({ message })
            break
          case '!buttons':
            this.handleTestButtonsMessage({ chat })
            break
          case '!list':
            this.handleTestListMessage({ chat })
            break
          default:
            this.handleMessage({ chat, message })
            break
        }
      } catch (error) {
        this._console.error(error)
        console.log(error.stack)
      }
    })
  }

  handleTestPingMessage ({ message }) {
    message.reply('pong')
  }

  handleTestButtonsMessage ({ chat }) {
    const buttons = new Buttons('Button body', [{ body: 'bt1' }, { body: 'bt2' }, { body: 'bt3' }], 'title', 'footer')
    chat.sendMessage('Sending buttons')
    chat.sendMessage(buttons)
  }

  handleTestListMessage ({ chat }) {
    const sections = [{ title: 'sectionTitle', rows: [{ id: 'customId', title: 'ListItem1', description: 'desc' }, { title: 'ListItem2' }] }]
    const list = new List('aaa', 'btnText', sections, 'Title', 'footer')
    chat.sendMessage('Sending list')
    chat.sendMessage(list)
  }

  async handleMessage ({ chat, message }) {
    const action = await this.digestIncomingMessage({ message, chat })

    this.sendActionMessages({ chat, action, incomingMessage: message })
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
  digestIncomingMessage ({ message, chat }) {
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
  async sendActionMessages ({ chat, action, incomingMessage }) {
    try {
      // Send all messages in action
      for (const message of action.get.messages) {
        let media = null
        switch (message.behavior) {
          case 'reply':
            incomingMessage.reply(message.body)
            break
          case 'image':
            media = await MessageMedia.fromUrl(message.body)
            chat.sendMessage(media)
            break
          case 'simple':
          default:
            chat.sendMessage(message.body)
            break
        }
      }
    } catch (error) {
      this._console.error(error)
      console.log(error.stack)
    }
  }
}

module.exports = ClientController
