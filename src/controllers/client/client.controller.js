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
    this.qr_attempts = 0
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
    this.#defineEvents()
    this._whatsappClient.initialize()

    this.#sendEvent('create-client#response', {})
  }

  /**
   * Define all WhatsApp events
   */
  async #defineEvents () {
    this._whatsappClient.on('qr', (qr) => {
      this._console.info('QR Received')

      qrcode.generate(qr, { small: true })
      this.#sendEvent('wh-client-qr#event', { qr })

      this.qr_attempts += 1

      if (this.qr_attempts >= +this._user.settings.max_qr_attempts) {
        this._whatsappClient.destroy()
        this.#sendEvent('wh-client-qr-destroyed#event', { qr })
      }
    })

    this._whatsappClient.on('ready', () => {
      this._console.info('Client is ready!')
      this.#sendEvent('wh-client-ready#event', { success: true })
    })

    this._whatsappClient.on('message', async (message) => {
      try {
        const chat = await message.getChat()

        this.#handleMessage({ chat, message })
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

  async #handleMessage ({ chat, message }) {
    // Send to queue incomind message
    this.#sendEvent('conversation-message#event', { client: chat.id, message: message.body, type: message.type })

    const action = await this.#digestIncomingMessage({ message, chat })

    this.#sendEvent('conversation-message#event', { client: 'go-bot', message: action.get, type: 'chat' })

    this.#sendActionMessages({ chat, action, incomingMessage: message })
  }

  /**
   * Find if exist current conversation in memory to prevent memory misuse
   * @param {Object} chat
   * @returns Conversation or null if not exist en memory
   */
  #findConversationInMemory (chat) {
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
  #digestIncomingMessage ({ message, chat }) {
    try {
      let conversation = this.#findConversationInMemory(chat)

      if (conversation === null) {
        conversation = new this._controllers.ConversationController(
          this._dependencies,
          {
            bots: this._bots,
            chat,
            socket: this._socket
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
  async #sendActionMessages ({ chat, action, incomingMessage }) {
    try {
      // Send all messages in action
      for (const message of action.get.messages) {
        switch (message.behavior) {
          case 'reply':
            this.#sendReplyMessage({ chat, action, incomingMessage, message })
            break
          case 'image':
            await this.#sendImageMessage({ chat, action, incomingMessage, message })
            break
          case '!ping':
            this.#sendPingMessage({ chat, action, incomingMessage, message })
            break
          case '!buttons':
            this.#sendButtonsMessage({ chat, action, incomingMessage, message })
            break
          case '!list':
            this.#sendListMessage({ chat, action, incomingMessage, message })
            break
          case 'simple':
          default:
            this.#sendSimpleMessage({ chat, action, incomingMessage, message })
            break
        }
      }
    } catch (error) {
      this._console.error(error)
      console.log(error.stack)
    }
  }

  #sendSimpleMessage ({ chat, message }) {
    chat.sendMessage(message.body)
  }

  async #sendImageMessage ({ chat, message }) {
    const media = await MessageMedia.fromUrl(message.body)
    chat.sendMessage(media)
  }

  #sendReplyMessage ({ incomingMessage, message }) {
    incomingMessage.reply(message.body)
  }

  #sendPingMessage ({ message }) {
    message.reply('pong: ' + message.body)
  }

  #sendButtonsMessage ({ chat, message }) {
    const buttons = new Buttons('Button body', [{ body: 'bt1' }, { body: 'bt2' }, { body: 'bt3' }], 'title', 'footer')
    chat.sendMessage(message.body)
    chat.sendMessage(buttons)
  }

  #sendListMessage ({ chat, message }) {
    const sections = [{ title: 'sectionTitle', rows: [{ id: 'customId', title: 'ListItem1', description: 'desc' }, { title: 'ListItem2' }] }]
    const list = new List('aaa', 'btnText', sections, 'Title', 'footer')
    chat.sendMessage(message.body)
    chat.sendMessage(list)
  }
}

module.exports = ClientController
