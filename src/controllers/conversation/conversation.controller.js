const InputTypeValidator = require('../../validators/inputType.validator')

class ConversationController {
  constructor (dependencies, { bots, chat }) {
    this._dependencies = dependencies
    this._config = this._dependencies.config
    this._console = this._dependencies.console
    this._utilities = this._dependencies.utilities
    this._controllers = this._dependencies.controllers
    this._models = this._dependencies.models
    this._nextChatIntentId = null
    this._messages = []
    this._bots = bots
    this._chat = chat
    this._currentBot = null
    this._currentStepAction = {
      scope: '',
      service: '',
      intent: '',
      goto: '',
    }

    this._backendController = new this._controllers.BackendController(this._dependencies)
  }

  processMessage (args) {
    return this.#messageHandler(args)
  }

  #getBotIdByTrigger ({ message }) {
    let response = {
      isTrigger: false,
      botId: null,
      triggerId: null
    }

    for (const bot of this._bots) {
      for (const trigger of bot.triggers) {
        if (trigger.condition.inputType === 'exact-match' && trigger.condition.key === message.body) {
          response = {
            isTrigger: true,
            botId: bot.id,
            triggerId: trigger.id
          }

          return response
        }
      }
    }

    const defaultBot = this._bots.find(bot => bot.isDefault === true)
    const defaultTrigger = defaultBot.triggers.find(trigger => trigger.isDefault === true)

    response = {
      isTrigger: true,
      botId: defaultBot.id,
      triggerId: defaultTrigger.id
    }

    return response
  }

  #getBotById (id) {
    if (!id) {
      return null
    }

    return this._bots.find(bot => bot.id === id)
  }

  #getTriggerById (id) {
    if (!id) {
      return null
    }

    return this._currentBot.triggers.find(trigger => trigger.id === id)
  }

  #getActionByStep () {
    if (this._currentStepAction.scope === 'internal' && this._currentStepAction.service === 'actions') {
      return this._currentBot.actions.find(action => action.id === this._currentStepAction.actionId)
    }

    return this.#getDefaultAction()
  }

  #processTrigger (botByTrigger) {
    if (!botByTrigger) {
      return this.#getDefaultAction()
    }

    const trigger = this.#getTriggerById(botByTrigger.triggerId)
    return trigger.then
  }

  #getDefaultAction () {
    return {
      scope: 'internal',
      service: 'action',
      intent: 'start',
      goto: this._currentBot.id,
    }
  }

  async #messageHandler ({ message }) {
    try {
      let actionRaw = null

      // Send to current stack memory the incoming message
      this._messages.push({ client: this._chat.id, message: message.body, type: message.type })

      const botByTriggerResponse = this.#getBotIdByTrigger({ message })

      if (botByTriggerResponse && botByTriggerResponse.isTrigger && botByTriggerResponse.botId) {
        this._currentBot = this.#getBotById(botByTriggerResponse.botId)
        this._currentStepAction = this.#processTrigger(botByTriggerResponse)
        this._console.info('Current step action: ')
        this._console.log(this._currentStepAction)
      }

      actionRaw = this.#getActionByStep()
      const action = new this._models.Action(actionRaw, this._dependencies)

      this._messages.push({ client: 'go-bot', message: action, type: 'chat' })

      return action
    } catch (error) {
      this._console.error(error)
    }


    /* intentAction = await this.#intentActionHandler({ message })

    if (!intentAction) {
      console.log(`No exist flow for this message: ${message.body}`)
      this._messages.push({ client: 'go-bot', message: null, type: 'chat' })
      return
    }

    // Set a reactive message into stack
    this._messages.push({ client: 'go-bot', message: intentAction, type: 'chat' })

    // Intent to launch a preflight event
    await this.#preflightChatActionHandler({ intentAction, message })

    return intentAction */
  }

  async #preflightChatActionHandler ({ intentAction }) {
    console.log(JSON.stringify({
      user: this._chat.id,
      conversation: this._messages
    }))
    if (intentAction.services && intentAction.services.preflight) {
      this.#backendServiceHandler({ intentAction })
    }

    intentAction.messages.map(message => {
      message.body = message.body.replace('{{INCOMING_MESSAGE}}', message.body)
      message.body = message.body.replace('{{INCOMING_PHONE}}', this._chat.id)
    })
  }

  async #backendServiceHandler ({ intentAction }) {
    const response = await this._backendController.request({
      route: intentAction.services.preflight.route,
      method: intentAction.services.preflight.method,
      parameters: { chat: this._chat, message }
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
    if (!this._nextChatIntentId) {
      return intent.id
    }

    return this._nextChatIntentId
  }

  async #intentActionHandler ({ message }) {
    console.log('next chat action: ', this._nextChatIntentId)
    const inputValidator = new InputTypeValidator()
    const defaultNoKey = this.#getIntentByKey()
    let intent = this.#getIntentByKey('start')
    let currentIntentActionId = null

    if (message.type !== 'chat') {
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
    this._nextChatIntentId = this.#getNextChatIntentId({ intent, payload: chatActionValidation.payload })

    if (this._nextChatIntentId === 'start') {
      this._nextChatIntentId = null
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

  get chat () {
    return this._chat
  }
}

module.exports = ConversationController
