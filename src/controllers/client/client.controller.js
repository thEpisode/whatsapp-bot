const { WhatsAppCloudApi } = require('whatsapp-cloud-api.js')

class ClientController {
  constructor (dependencies, { user }) {
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
    this._whatsappClient = new WhatsAppCloudApi({
      appToken: this._user.settings.appToken
    })
  }

  async handleMessage ({ chat, message }) {
    const action = await this.#digestIncomingMessage({ message, chat })

    this.#sendActionMessages({ chat, action, incomingMessage: message })
  }

  /**
   * Receive and process the incoming message
   * @param {Object} message Is the incoming message with all metadata from whatsapp
   * @param {Object} chat Is the related chat of incoming message
   * @returns Action, in other words, what need to response to incoming message
   */
  #digestIncomingMessage ({ message, chat }) {
    try {
      const conversation = new this._controllers.ConversationController(
        this._dependencies,
        {
          bots: this._bots,
          chat
        }
      )

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
    _whatsappClient.sendMessage(message.body)
  }

  async #sendImageMessage ({ chat, message }) {
    const media = await MessageMedia.fromUrl(message.body)
    _whatsappClient.sendMessage(media)
  }

  #sendReplyMessage ({ incomingMessage, message }) {
    _whatsappClient.reply(message.body)
  }

  #sendPingMessage ({ message }) {
    _whatsappClient.reply('pong: ' + message.body)
  }

  #sendButtonsMessage ({ chat, message }) {
    const buttons = new Buttons('Button body', [{ body: 'bt1' }, { body: 'bt2' }, { body: 'bt3' }], 'title', 'footer')
    _whatsappClient.sendMessage(message.body)
    _whatsappClient.sendMessage(buttons)
  }

  #sendListMessage ({ chat, message }) {
    const sections = [{ title: 'sectionTitle', rows: [{ id: 'customId', title: 'ListItem1', description: 'desc' }, { title: 'ListItem2' }] }]
    const list = new List('aaa', 'btnText', sections, 'Title', 'footer')
    _whatsappClient.sendMessage(message.body)
    _whatsappClient.sendMessage(list)
  }
}

module.exports = ClientController
