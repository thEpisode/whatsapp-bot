const InputTypeValidator = require('../../validators/inputType.validator')
const { NLPFactory } = require('./../../factories/index')

class ConversationController {
  constructor (dependencies, { bots, chat }) {
    /* Base Properties */
    this._dependencies = dependencies
    this._config = this._dependencies.config
    this._console = this._dependencies.console
    this._utilities = this._dependencies.utilities
    this._controllers = this._dependencies.controllers
    this._models = this._dependencies.models

    /* Custom Properties */
    this._eventBus = dependencies.eventBus

    /* Assigments */
    this._nextChatIntentId = null
    this._messages = []
    this._bots = bots
    this._chat = chat
    this._currentBot = null
    this._state = {
      scope: '',
      service: '',
      botId: '',
      actionId: ''
    }

    this._backendController = new this._controllers.BackendController(this._dependencies)
    this._nlpFactory = new NLPFactory(this._dependencies)
    this._nlp = this._nlpFactory.create()
  }

  processMessage (args) {
    if (!args) {
      throw new Error('Required args to process this message')
    }

    // Send to current stack memory the incoming message
    this._messages.push({ client: this._chat.id, message: args.message.body, type: args.message.type })

    return this.#analizeMessage(args)
  }

  async #analizeMessage ({ message }) {
    // Try to catch a trigger with incomming message
    const triggerResponse = this.#triggerHandler({ message })

    if (triggerResponse && triggerResponse.isTriggered) {
      this._console.info('Incoming message is triggered: ' + message.body)

      const transformedMessages = this.#transformActionMessages({ action: triggerResponse.action, incomingMessage: message })
      triggerResponse.action.updateProperty({ property: 'messages', value: transformedMessages })

      this._messages.push({ client: 'go-bot', message: triggerResponse, type: 'chat' })
      
      return triggerResponse.action
    }

    // Try to catch an action with incoming message
    const actionResponse = this.#actionHandler({ message })

    if (actionResponse && actionResponse.isMatched) {
      this._console.info('Incoming message is matched from action: ' + message.body)

      const transformedMessages = this.#transformActionMessages({ action: actionResponse.action, incomingMessage: message })
      actionResponse.action.updateProperty({ property: 'messages', value: transformedMessages })

      this._messages.push({ client: 'go-bot', message: actionResponse, type: 'chat' })

      return actionResponse.action
    }

    const nlpResponse = await this.#nlpHandler({ message })

    if (nlpResponse && nlpResponse.isPredicted) {
      this._console.info('Incoming message is predicted from action: ' + message.body)
      const nlpTriggerResponse = await this.#analizeMessage({ message: {body: nlpResponse.prediction} })

      this._messages.push({ client: 'go-bot', message: nlpTriggerResponse, type: 'chat' })

      return nlpTriggerResponse
    }

    // Setup and return default state
    this._console.info('Incoming message is not matched and not triggered: ' + message.body)

    return this.#getDefaultAction()
  }

  #triggerHandler ({ message }) {
    try {
      let actionRaw = null
      let actionDeepCopy = null
      let response = {
        isTriggered: false,
        action: null
      }

      const botByTriggerResponse = this.#getBotIdByTrigger({ message })

      if (!botByTriggerResponse || !botByTriggerResponse.isTrigger || !botByTriggerResponse.botId) {
        return response
      }

      this._currentBot = this.#getBotById(botByTriggerResponse.botId)
      this._state = this.#processTrigger(botByTriggerResponse)
      this._console.info('Current step action: ')
      this._console.log(this._state)

      actionRaw = this.#getActionByState()
      actionDeepCopy = JSON.parse(JSON.stringify(actionRaw))
      const action = new this._models.Action(actionDeepCopy, this._dependencies)

      if (action) {
        response = {
          isTriggered: true,
          action
        }
      }

      return response
    } catch (error) {
      this._console.error(error)
      console.log(error.stack)
    }
  }

  #actionHandler ({ message }) {
    try {
      let actionRaw = null
      let actionDeepCopy = null
      let response = {
        isMatched: false,
        action: null
      }

      const actionHandlerResponse = this.#processAction({ message })

      // Return action by default processed by #actionHandler
      if (!actionHandlerResponse || !actionHandlerResponse.isMatched) {
        response.action = actionHandlerResponse.action
        return response
      }

      actionRaw = this.#getActionByState()
      actionDeepCopy = JSON.parse(JSON.stringify(actionRaw))
      const action = new this._models.Action(actionDeepCopy, this._dependencies)

      if (action) {
        response = {
          isMatched: true,
          action
        }
      }

      return response
    } catch (error) {
      this._console.error(error)
      console.log(error.stack)
    }
  }

  async #nlpHandler ({ message }) {
    try {
      let response = {
        isPredicted: false,
        action: null
      }

      response = await this._nlp.predict({ message })

      return response
    } catch (error) {
      this._console.error(error)
      console.log(error.stack)
    }

  }

  #processTrigger (botByTrigger) {
    if (!botByTrigger) {
      return this.#getDefaultState()
    }

    const trigger = this.#getTriggerById(botByTrigger.triggerId)
    return trigger.then
  }

  #processAction ({ message }) {
    const inputValidator = new InputTypeValidator()
    const defaultState = this.#getDefaultState()
    const action = this.#getActionByState()
    let response = {
      isMatched: false,
      botId: null,
      actionId: null
    }

    if (message.type !== 'chat') {
      response = {
        isMatched: false,
        botId: this._currentBot.id,
        actionId: defaultState.id
      }
      return response
    }

    // No incidence
    if (!action) {
      response = {
        isMatched: false,
        botId: this._currentBot.id,
        actionId: defaultState.actionId
      }
      return response
    }

    // Validate the input message for current options
    const actionValidationResponse = inputValidator.validate({ action, message })

    if (!actionValidationResponse.isValid) {
      response = {
        isMatched: false,
        botId: this._currentBot.id,
        actionId: defaultState.actionId
      }
      return response
    }

    this.#setState(actionValidationResponse.intent)

    response = {
      isMatched: true,
      botId: actionValidationResponse.intent.botId,
      actionId: actionValidationResponse.intent.actionId
    }

    return response
  }

  #transformActionMessages ({ action, incomingMessage }) {
    let messages = action.get.messages.slice()

    messages = messages.map(message => {
      message.body = message.body.replace('{{INCOMING_MESSAGE}}', incomingMessage.body)
      message.body = message.body.replace('{{INCOMING_PHONE}}', this._chat.id.user)

      return message
    })

    return messages
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
            triggerId: trigger.id,
            trigger,
            bot
          }

          return response
        } else if (trigger.condition.inputType === 'starting-point' && !this._state.botId && !this._state.actionId) {
          response = {
            isTrigger: true,
            botId: bot.id,
            triggerId: trigger.id,
            trigger,
            bot
          }
        }
      }
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

  #getActionByState () {
    if (this._state.scope === 'internal' && this._state.service === 'actions') {
      return this._currentBot.actions.find(action => action.id === this._state.actionId)
    } else if (this._state.scope === 'external' && this._state.service === 'bot') {
      this._currentBot = this._bots.find(bot => bot.id === this._state.botId)
      return this._currentBot.actions.find(action => action.id === this._state.actionId)
    }

    return this.#getDefaultState()
  }

  #getDefaultBot () {
    return this._bots.find(bot => bot.isDefault === true)
  }

  #getDefaultState () {
    if (!this._currentBot) {
      this._currentBot = this.#getDefaultBot()
    }

    return {
      scope: 'internal',
      service: 'actions',
      actionId: 'start',
      botId: this._currentBot.id
    }
  }

  #setDefaultState () {
    this._state = this.#getDefaultState()
  }

  #setState ({ scope, service, actionId, botId }) {
    this._state = {
      scope,
      service,
      botId,
      actionId
    }
  }

  #getDefaultAction () {
    this.#setDefaultState()
    const actionRaw = this.#getActionByState()
    return new this._models.Action(actionRaw, this._dependencies)
  }

  async #preflightChatActionHandler ({ intentAction }) {
    console.log(JSON.stringify({
      user: this._chat.id,
      conversation: this._messages
    }))
    if (intentAction.services && intentAction.services.preflight) {
      this.#backendServiceHandler({ intentAction })
    }

    intentAction.messages = intentAction.messages.map(message => {
      message.body = message.body.replace('{{INCOMING_MESSAGE}}', message.body)
      message.body = message.body.replace('{{INCOMING_PHONE}}', this._chat.id)

      return message
    })
  }

  async #backendServiceHandler ({ intentAction, message }) {
    const response = await this._backendController.request({
      route: intentAction.services.preflight.route,
      method: intentAction.services.preflight.method,
      parameters: { chat: this._chat, message }
    })

    if (!this._utilities.response.isValid(response)) {
      intentAction.message = [{ body: response.body }]
    }
  }

  get chat () {
    return this._chat
  }
}

module.exports = ConversationController
