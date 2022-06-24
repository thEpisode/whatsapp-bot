const { WhatsAppCloudApi } = require('whatsapp-cloud-api.js')

class AgentController {
  constructor (dependencies, { user, apps, bots, settings }) {
    /* Base Properties */
    this._dependencies = dependencies
    this._config = this._dependencies.config
    this._console = this._dependencies.console
    this._controllers = this._dependencies.controllers

    /* Custom Properties */
    this._appController = null
    this._eventBus = dependencies.eventBus

    /* Assigments */
    this._apps = apps || null
    this._bots = bots || null
    this._user = user || null
    this._settings = settings || null
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

  async startSession () {
    if (!this._user) {
      throw new Error('Required user data to process this message')
    }

    // Load apps
    this._appController = new this._controllers.AppController(this._dependencies)

    // Setup apps
    this._appController.loadApps({ apps: this._apps })
    this._dependencies.apps = this._appController

    // Load WhatsApp client
    this._whatsappClient = new WhatsAppCloudApi({
      appToken: this._settings.whatsapp.appToken
    })
  }

  async handleMessage ({ message }) {
    const action = await this.#digestIncomingMessage({ message })

    this.#sendActionMessages({ action, incomingMessage: message })
  }

  /**
   * Receive and process the incoming message
   * @param {Object} message Is the incoming message with all metadata from whatsapp
   * @returns Action, in other words, what need to response to incoming message
   */
  #digestIncomingMessage ({ message }) {
    try {
      const conversation = new this._controllers.ConversationController(
        this._dependencies,
        {
          bots: this._bots
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
   * @param {Object} action Is the action related to incoming message
   */
  async #sendActionMessages ({ action, incomingMessage }) {
    try {
      // Send all messages in action
      for (const message of action.get.messages) {
        switch (message.behavior) {
          case 'reply':
            this.#sendReplyMessage({ action, incomingMessage, message })
            break
          case 'image':
            await this.#sendImageMessage({ action, incomingMessage, message })
            break
          case '!ping':
            this.#sendPingMessage({ action, incomingMessage, message })
            break
          case '!buttons':
            this.#sendButtonsMessage({ action, incomingMessage, message })
            break
          case '!list':
            this.#sendListMessage({ action, incomingMessage, message })
            break
          case 'simple':
          default:
            this.#sendSimpleMessage({ action, incomingMessage, message })
            break
        }
      }
    } catch (error) {
      this._console.error(error)
      console.log(error.stack)
    }
  }

  async #sendSimpleMessage ({ incomingMessage, message }) {
    try {
      const response = await this._whatsappClient.sendMessage({
      type: 'text',
      to: incomingMessage.to,
      from: incomingMessage.from,
      message
    })

    console.log(response)
    } catch (error) {
      console.error(error)
    }
    
  }

  async #sendImageMessage ({ message }) {
    const media = await MessageMedia.fromUrl(message.body)
    this._whatsappClient.sendMessage(media)
  }

  #sendReplyMessage ({ message }) {
    this._whatsappClient.reply(message.body)
  }

  #sendPingMessage ({ message }) {
    this._whatsappClient.reply('pong: ' + message.body)
  }

  #sendButtonsMessage ({ message }) {
    const buttons = new Buttons('Button body', [{ body: 'bt1' }, { body: 'bt2' }, { body: 'bt3' }], 'title', 'footer')
    this._whatsappClient.sendMessage(message.body)
    this._whatsappClient.sendMessage(buttons)
  }

  #sendListMessage ({ message }) {
    const sections = [{ title: 'sectionTitle', rows: [{ id: 'customId', title: 'ListItem1', description: 'desc' }, { title: 'ListItem2' }] }]
    const list = new List('aaa', 'btnText', sections, 'Title', 'footer')
    this._whatsappClient.sendMessage(message.body)
    this._whatsappClient.sendMessage(list)
  }
}

module.exports = AgentController
