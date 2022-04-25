/**
 * @typedef {Object} InputTypeArgs
 * @property {object} intentAction Current conversation intent action.
 * @property {object} message - Is the incoming message.
 */
/**
 * @typedef {Object} InputTypeResult
 * @property {object} intentAction Current conversation intent action.
 * @property {object} message - Is the incoming message.
 */
const backend = require('../backend/backend.controller')
const utilities = require('../../core/utilities.manager')()

class ConversationController {
  constructor ({ chat, config }) {
    this.nextChatActionId = null
    this.config = config
    this.messages = []
    this.chat = chat
  }

  processMessage (args) {
    return this.messageHandler(args)
  }

  async messageHandler ({ message }) {
    let intentAction = null

    this.messages.push({ client: this.chat.id, message: message.body, type: message.type })
    intentAction = await this.chatActionHandler({ message })

    if (!intentAction) {
      console.log(`No exist flow for this message: ${message.body}`)
      this.messages.push({ client: 'go bot', message: null, type: 'chat' })
      return
    }

    this.messages.push({ client: 'go bot', message: intentAction, type: 'chat' })

    await this.preflightChatActionHandler({ message, intentAction })

    return intentAction
  }

  async preflightChatActionHandler ({ intentAction }) {
    console.log(JSON.stringify({
      user: this.chat.id,
      conversation: this.messages
    }))
    if (intentAction.services && intentAction.services.preflight) {
      this.backendHandler({ intentAction })
    }

    intentAction.messages.map(message => {
      message.body = message.body.replace('{{INCOMING_MESSAGE}}', message.body)
      message.body = message.body.replace('{{INCOMING_PHONE}}', this.chat.id)
    })
  }

  async backendHandler ({ intentAction }) {
    const response = await backend.request({
      route: intentAction.services.preflight.route,
      method: intentAction.services.preflight.method,
      parameters: { chat: this.chat, message }
    })

    if (!utilities.response.isValid(response)) {
      intentAction.message = [{ body: response.body }]
    }
  }

  async chatActionHandler ({ message }) {
    console.log('next chat action: ', this.nextChatActionId)
    const defaultNoKey = JSON.parse(JSON.stringify(utilities.searchers.object.findObject('no-key', 'id', this.config.botKeyActions)))
    let currentChatActionId = null
    let intentAction = null

    if (message.type !== 'chat') {
      return defaultNoKey
    }

    // If not exist last question
    if (!this.nextChatActionId) {
      const intent = utilities.searchers.object.findObject('seed', 'id', this.config.botKeyActions)
      currentChatActionId = intent.id
    } else {
      currentChatActionId = this.nextChatActionId
    }

    const intent = utilities.searchers.object.findObject(currentChatActionId, 'id', this.config.botKeyActions)
    intentAction = JSON.parse(JSON.stringify(intent || null))

    // No incidence
    if (!intentAction) {
      return defaultNoKey
    }

    const chatActionValidation = this.validateInputType({ intentAction, message })

    if (!chatActionValidation.isValid) {
      return defaultNoKey
    }

    this.nextChatActionId = this.getNextChatActionId({ intentAction, payload: chatActionValidation.payload })
    const nextQuestion = utilities.searchers.object.findObject(this.nextChatActionId, 'id', this.config.botKeyActions)
    intentAction = JSON.parse(JSON.stringify(nextQuestion || null))

    if (this.nextChatActionId === 'genesys') {
      this.nextChatActionId = null
    }

    return intentAction
  }

  /**
   * Validate if input type of current action is valid
   */
  validateInputType ({ intentAction, message }) {
    let input = {
      isValid: false,
      payload: {}
    }

    switch (intentAction.inputType) {
      case 'regex':
        input = this.validateInputTypeRegex({ intentAction, message })
        break
      case 'option-string':
        input = this.validateInputTypeOptionString({ intentAction, message })
        break
      case 'any':
        input = this.validateInputTypeAny({ intentAction, message })
        break
      case 'any-number':
        input = this.validateInputTypeAnyNumber({ intentAction, message })
        break
    }

    return input
  }

  invalidInput ({ messages }) {
    return {
      payload: {
        id: 'no-key',
        messages: [
          {
            'body': 'I can\'t process this message, please validate your information'
          },
          ...messages
        ],
        services: {
          preflight: null,
          callback: null
        }
      },
      isValid: false
    }
  }

  /**
   * Validate the type "Option String" and return current error messages
   * @param {InputTypeArgs} args - Arguments to validate given input type.
   * @returns {InputTypeResult} result - Is the result of given input type.
   */
  validateInputTypeOptionString ({ intentAction, message }) {
    let payload = {}
    let isValid = false

    if (!intentAction.validOptions || !intentAction.validOptions.length) {
      return this.invalidInput({
        messages: [
          {
            body: 'Error: Input not match with valid options'
          }
        ]
      })
    }

    if (!message || !message.body) {
      return this.invalidInput({
        messages: [
          {
            body: 'Error: Input has not a valid body'
          }
        ]
      })
    }

    // Iterate over every valid options
    payload = intentAction.validOptions.find(option => {
      // Regex for whole word in options, NOT CONTAINS
      const regex = new RegExp('\\b(' + option.key.toLocaleLowerCase().trim() + ')\\b', 'g')
      if (message.body.toLocaleLowerCase().trim().match(regex)) {
        isValid = true
        return true
      }
    })

    return {
      payload,
      isValid
    }
  }

  /**
   * Validate the type "Any" and return current error messages
   * @param {InputTypeArgs} args - Arguments to validate given input type.
   * @returns {InputTypeResult} result - Is the result of given input type.
   */
  validateInputTypeAny ({ intentAction, message }) {
    let payload = {}
    let isValid = false

    if (!message || !message.body) {
      return this.invalidInput({
        messages: [
          {
            body: 'Error: Input has not a valid body'
          }
        ]
      })
    }

    if (!intentAction.validOptions || !intentAction.validOptions.length) {
      return this.invalidInput({
        messages: [
          {
            body: 'Error: Input not match with valid options'
          }
        ]
      })
    }

    return {
      payload,
      isValid
    }
  }

  /**
   * Validate the type "Any Number" and return current error messages
   * @param {InputTypeArgs} args - Arguments to validate given input type.
   * @returns {InputTypeResult} Action of given input type.
   */
  validateInputTypeAnyNumber ({ intentAction, message }) {
    let payload = {}
    let isValid = false
    
    if (!message || !message.body) {
      return this.invalidInput({
        messages: [
          {
            body: 'Error: Input has not a valid body'
          }
        ]
      })
    }

    if (!intentAction.validOptions || !intentAction.validOptions.length) {
      return this.invalidInput({
        messages: [
          {
            body: 'Error: Input not match with valid options'
          }
        ]
      })
    }
    
    if (isNaN(message.body.toLocaleLowerCase().trim())) {
      return this.invalidInput({
        messages: [
          {
            body: 'Error: Input is not a number'
          }
        ]
      })
    }

    isValid = true

    return {
      payload,
      isValid
    }
  }

  /**
   * Validate the type "Any Number" and return current error messages
   * @param {InputTypeArgs} args - Arguments to validate given input type.
   * @returns {InputTypeResult} Action of given input type.
   */
  validateInputTypeRegex ({ intentAction, message }) {
    let payload = {}
    let isValid = false

    if (!message || !message.body) {
      return this.invalidInput({
        messages: [
          {
            body: 'Error: Input has not a valid body'
          }
        ]
      })
    }

    if (!intentAction.validOptions || !intentAction.validOptions.length) {
      return this.invalidInput({
        messages: [
          {
            body: 'Error: Input not match with valid options'
          }
        ]
      })
    }

    // TODO: Improve match
    const regex = new RegExp(intentAction.validOptions.toLocaleLowerCase().trim(), 'g')
    if (message.body.toLocaleLowerCase().trim().match(regex, 'g')) {
      isValid = true
      payload = { isMatched: true }
    } else {
      payload = { isMatched: false }
    }

    return {
      payload,
      isValid
    }
  }

  getNextChatActionId ({ intentAction, payload }) {
    let actionId = 'eoi-failed'
    let option = {}

    switch (intentAction.inputType) {
      case 'regex':
        if (payload && payload.isMatched) {
          option = intentAction.validOptions.find(validOption => validOption.key.toLocaleLowerCase().trim() === 'matched')
          actionId = option.goto
        } else {
          option = intentAction.validOptions.find(validOption => validOption.key.toLocaleLowerCase().trim() === '!matched')
          actionId = option.goto
        }
        break
      case 'option-string':
        option = intentAction.validOptions.find(validOption => validOption.key.toLocaleLowerCase().trim() === payload.key.toLocaleLowerCase().trim())

        if (option) {
          actionId = option.goto
        }
        break
      case 'any':
        actionId = intentAction.validOptions[0].goto
        break
      case 'any-number':
        actionId = intentAction.validOptions[0].goto
        break
    }

    return actionId
  }
}

module.exports = ConversationController
