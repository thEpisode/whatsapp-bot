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

    await this.preflightChatActionHandler({ message, chatAction: intentAction })

    return intentAction
  }

  async preflightChatActionHandler ({ message, chatAction }) {
    console.log(JSON.stringify({
      user: this.chat.id,
      conversation: this.messages
    }))
    if (chatAction.services && chatAction.services.preflight) {
      this.backendHandler({ chatAction })
    }

    chatAction.messages.map(message => {
      message.body = message.body.replace('{{INCOMING_MESSAGE}}', message.body)
      message.body = message.body.replace('{{INCOMING_PHONE}}', this.chat.id)
    })
  }

  async backendHandler ({ chatAction }) {
    const response = await backend.request({
      route: chatAction.services.preflight.route,
      method: chatAction.services.preflight.method,
      parameters: { chat: this.chat, message }
    })

    if (!utilities.response.isValid(response)) {
      chatAction.message = [{ body: response.body }]
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
      const intent = utilities.searchers.object.findObject('genesys', 'id', this.config.botKeyActions)
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

    const chatActionValidation = this.validateInputType({ chatAction: intentAction, message })

    if (!chatActionValidation.isValid) {
      return defaultNoKey
    }

    this.nextChatActionId = this.getNextChatActionId({ chatAction: intentAction, payload: chatActionValidation.payload })
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
  validateInputType ({ chatAction, message }) {
    let isValid = false
    let payload = {}

    switch (chatAction.inputType) {
      case 'regex':
        // TODO: Improve match
        const regex = new RegExp(chatAction.validOptions.toLocaleLowerCase().trim(), 'g')
        if (message.body.toLocaleLowerCase().trim().match(regex, 'g')) {
          isValid = true
          payload = { isMatched: true }
        } else {
          payload = { isMatched: false }
        }
        break;
      case 'number':
        if (!isNaN(message.body.toLocaleLowerCase().trim())) {
          isValid = true
        }
        break
      case 'option-string':
        if (chatAction.validOptions && chatAction.validOptions.length) {
          payload = chatAction.validOptions.find(option => {
            // Regex for whole word in options, NOT CONTAINS
            const regex = new RegExp('\\b(' + option.key.toLocaleLowerCase().trim() + ')\\b', 'g')
            if (message.body.toLocaleLowerCase().trim().match(regex)) {
              return true
            }
          })

          if (payload) {
            isValid = true
          }
        }
        break
      case 'any':
        isValid = true
        break;
    }

    return { isValid, payload }
  }

  getNextChatActionId ({ chatAction, payload }) {
    let actionId = 'eoi-failed'

    switch (chatAction.inputType) {
      case 'regex':
        if (payload && payload.isMatched) {
          const option = chatAction.validOptions.find(option => option.key.toLocaleLowerCase().trim() === 'matched')
          actionId = option.goto
        } else {
          const option = chatAction.validOptions.find(option => option.key.toLocaleLowerCase().trim() === '!matched')
          actionId = option.goto
        }

        break;
      case 'number':
        actionId = chatAction.validOptions[0].goto
        break
      case 'option-string':
        const option = chatAction.validOptions.find(option => option.key.toLocaleLowerCase().trim() === payload.key.toLocaleLowerCase().trim())

        if (option) {
          actionId = option.goto
        }
        break
      case 'any':
        actionId = chatAction.validOptions[0].goto
        break;
    }

    return actionId
  }
}

module.exports = ConversationController
