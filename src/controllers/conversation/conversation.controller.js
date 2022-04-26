const InputTypeValidator = require('../../validators/inputType.validator')

class ConversationController {
  constructor (dependencies, { chat }) {
    this._dependencies = dependencies
    this._config = this._dependencies.config
    this._utilities = this._dependencies.utilities
    this._controllers = this._dependencies.controllers
    this.nextChatIntentId = null
    this.messages = []
    this.chat = chat

    this._backendController = new this._controllers.Backend(this._dependencies)
  }

  processMessage (args) {
    return this.messageHandler(args)
  }

  async messageHandler ({ message }) {
    let intentAction = null

    this.messages.push({ client: this.chat.id, message: message.body, type: message.type })
    intentAction = await this.#intentActionHandler({ message })

    if (!intentAction) {
      console.log(`No exist flow for this message: ${message.body}`)
      this.messages.push({ client: 'go-bot', message: null, type: 'chat' })
      return
    }

    // Set a reactive message into stack
    this.messages.push({ client: 'go-bot', message: intentAction, type: 'chat' })

    // Intent to launch a preflight event
    await this.preflightChatActionHandler({ intentAction, message })

    return intentAction
  }

  async preflightChatActionHandler ({ intentAction }) {
    console.log(JSON.stringify({
      user: this.chat.id,
      conversation: this.messages
    }))
    if (intentAction.services && intentAction.services.preflight) {
      this.#backendServiceHandler({ intentAction })
    }

    intentAction.messages.map(message => {
      message.body = message.body.replace('{{INCOMING_MESSAGE}}', message.body)
      message.body = message.body.replace('{{INCOMING_PHONE}}', this.chat.id)
    })
  }

  async #backendServiceHandler ({ intentAction }) {
    const response = await this._backendController.request({
      route: intentAction.services.preflight.route,
      method: intentAction.services.preflight.method,
      parameters: { chat: this.chat, message }
    })

    if (!this._utilities.response.isValid(response)) {
      intentAction.message = [{ body: response.body }]
    }
  }

  /**
   * Return a chatbot intent with given key
   * @param {string} key Is a string key to find in the current intents
   * @returns An object with given key or default message
   */
  #getIntentByKey (key) {
    return JSON.parse(JSON.stringify(this._utilities.searchers.object.findObject(key || 'no-key', 'id', this._config.botKeyActions) || null))
  }

  #getCurrentIntentAction (intent) {
    // Navigate to start intent
    if (!this.nextChatIntentId) {
      return intent.id
    }

    return this.nextChatIntentId
  }

  async #intentActionHandler ({ message }) {
    console.log('next chat action: ', this.nextChatIntentId)
    const inputValidator = new InputTypeValidator()
    const defaultNoKey = this.#getIntentByKey()
    let intent = this.#getIntentByKey('start')
    let currentIntentActionId = null

    if (message.
      type !== 'chat') {
      return defaultNoKey
    }

    // Get the current intent action
    currentIntentActionId = this.#getCurrentIntentAction(intent)
    intent = this.#getIntentByKey(currentIntentActionId)

    // No incidence
    if (!intent) {
      return defaultNoKey
    }

    // Validate the input message for current options
    const chatActionValidation = inputValidator.validate({ intent, message })

    if (!chatActionValidation.isValid) {
      return defaultNoKey
    }

    // Get the next chat intent
    this.nextChatIntentId = this.#getNextChatIntentId({ intent, payload: chatActionValidation.payload })

    if (this.nextChatIntentId === 'start') {
      this.nextChatIntentId = null
    }

    return intent
  }

  #getNextChatIntentId ({ intent, payload }) {
    let actionId = 'eoi-failed'
    let option = {}

    switch (intent.inputType) {
      case 'regex':
        if (payload && payload.isMatched) {
          option = intent.validOptions.find(validOption => validOption.key.toLocaleLowerCase().trim() === 'matched')
          actionId = option.goto
        } else {
          option = intent.validOptions.find(validOption => validOption.key.toLocaleLowerCase().trim() === '!matched')
          actionId = option.goto
        }
        break
      case 'option-string':
        option = intent.validOptions.find(validOption => validOption.key.toLocaleLowerCase().trim() === payload.key.toLocaleLowerCase().trim())

        if (option) {
          actionId = option.goto
        }
        break
      case 'any':
        actionId = intent.validOptions[0].goto
        break
      case 'any-number':
        actionId = intent.validOptions[0].goto
        break
    }

    return actionId
  }
}

module.exports = ConversationController
