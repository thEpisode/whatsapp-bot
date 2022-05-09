const { Client, MessageMedia, List, Buttons } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')

class ClientController {
  constructor (dependencies, { socket, user }) {
    /* Base Properties */
    this._dependencies = dependencies
    this._config = this._dependencies.config
    this._console = this._dependencies.console
    this._controllers = this._dependencies.controllers

    /* Custom Properties */
    this._appController = null
    this._eventBus = dependencies.eventBus

    /* Assigments */
    this._bots = null
    this._apps = null
    this._user = user || null
    this._socket = socket
    this.nextChatActionId = null
    this.conversations = []
  }

  set socket (newSocket) {
    this._socket = newSocket
  }

  get client () {
    return this._whatsappClient
  }

  get user () {
    return this._user
  }

  set user (newUser) {
    this._user = newUser
  }

  get bots () {
    return this._bots
  }

  get apps () {
    return this._apps
  }

  /**
   * Initial point process
   */
  async startEngine () {
    await this.#startSession()
  }

  async #startSession () {
    if (!this._user) {
      throw new Error('Required user data to process this message')
    }

    this._apps = this._user.apps
    this._bots = this._user.bots

    // Load apps
    this._appController = new this._controllers.AppController(this._dependencies)

    // Setup apps
    this._appController.loadApps({ apps: this._apps })
    this._dependencies.apps = this._appController

    // Load WhatsApp client
    this._whatsappClient = new Client()

    // Setup Whatsapp Client
    this.defineEvents()
    this._whatsappClient.initialize()

    this.#sendEvent('create-client#response', {})
  }

  /**
   * Define all WhatsApp events
   */
  async defineEvents () {
    this._whatsappClient.on('qr', (qr) => {
      this._console.info('QR Received')
      qrcode.generate(qr, { small: true })
      this.#sendEvent('wh-client-qr#event', { qr })
    })

    this._whatsappClient.on('ready', () => {
      this._console.info('Client is ready!')
      this.#sendEvent('wh-client-ready#event', { success: true })
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

  #sendEvent (command, values) {
    const payload = {
      context: {
        channel: 'ws',
        type: 'internal-message',
        sender: { socketId: this._socket.id },
        nativeId: this._config.MACHINE_ID
      },
      command,
      values
    }

    this._eventBus.emit('server-event', payload)
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
