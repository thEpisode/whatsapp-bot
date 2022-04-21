const backend = require('../backend/backend.controller')
const utilities = require('../../core/utilities.manager')()

class ConversationController {
  constructor ({ page, config }) {
    this.nextChatActionId = null
    this.page = page
    this.config = config
    this.conversation = []
  }

  digestNewMessages (chat) {
    chat.messages.map((messageModel) => {
      this.messageHandler({ chat, messageModel })
    })
  }

  async messageHandler ({ chat, messageModel }) {
    let chatAction = null

    this.conversation.push({ client: chat.user, message: messageModel.message, type: messageModel.type })
    chatAction = await this.chatActionHandler({ messageModel })

    if (!chatAction) {
      console.log(`No exist flow for this message: ${messageModel.message}`)
      this.conversation.push({ client: 'go bot', message: null, type: 'chat' })
      return
    }

    this.conversation.push({ client: 'go bot', message: chatAction, type: 'chat' })

    await this.preflightChatActionHandler({ chat, messageModel, chatAction })

    this.page.evaluate(`window.whatsAppBus.sendMessage('${chat.id}', '${JSON.stringify(chatAction)}')`)
  }

  async preflightChatActionHandler ({ chat, messageModel, chatAction }) {
    console.log(JSON.stringify({
      user: chat.user,
      conversation: this.conversation
    }))
    if (chatAction.services && chatAction.services.preflight) {
      this.backendHandler({ chat, chatAction })
    }

    chatAction.flow.map(flowMessage => {
      flowMessage.message = flowMessage.message.replace('{{INCOMING_MESSAGE}}', messageModel.message)
      flowMessage.message = flowMessage.message.replace('{{INCOMING_PHONE}}', chat.user)
    })
  }

  async backendHandler ({ chat, chatAction }) {
    const response = await backend.request({
      route: chatAction.services.preflight.route,
      method: chatAction.services.preflight.method,
      parameters: { chat, messageModel }
    })

    if (!utilities.response.isValid(response)) {
      chatAction.flow = [{ message: response.message }]
    }
  }

  async chatActionHandler ({ messageModel }) {
    console.log('next chat action: ', this.nextChatActionId)
    const defaultNoKey = JSON.parse(JSON.stringify(utilities.searchers.object.findObject('no-key', 'id', this.config.botKeyActions)))
    let currentChatActionId = null
    let chatAction = null

    if (messageModel.type !== 'chat') {
      return defaultNoKey
    }

    // If not exist last question
    if (!this.nextChatActionId) {
      const question = utilities.searchers.object.findObject('genesys', 'id', this.config.botKeyActions)
      currentChatActionId = question.id
    } else {
      currentChatActionId = this.nextChatActionId
    }

    const question = utilities.searchers.object.findObject(currentChatActionId, 'id', this.config.botKeyActions)
    chatAction = JSON.parse(JSON.stringify(question || null))

    // No incidence
    if (!chatAction) {
      return defaultNoKey
    }

    const chatActionValidation = this.validateInputType({ chatAction, messageModel })

    if (!chatActionValidation.isValid) {
      return defaultNoKey
    }

    this.nextChatActionId = this.getNextChatActionId({ chatAction, payload: chatActionValidation.payload })
    const nextQuestion = utilities.searchers.object.findObject(this.nextChatActionId, 'id', this.config.botKeyActions)
    chatAction = JSON.parse(JSON.stringify(nextQuestion || null))

    if (this.nextChatActionId === 'genesys') {
      this.nextChatActionId = null
    }

    return chatAction
  }

  /**
   * Validate if input type of current action is valid
   */
  validateInputType ({ chatAction, messageModel }) {
    let isValid = false
    let payload = {}

    switch (chatAction.inputType) {
      case 'regex':
        // TODO: Improve match
        const regex = new RegExp(chatAction.validOptions.toLocaleLowerCase().trim(), 'g')
        if (messageModel.message.toLocaleLowerCase().trim().match(regex, 'g')) {
          isValid = true
          payload = { isMatched: true }
        } else {
          payload = { isMatched: false }
        }
        break;
      case 'number':
        if (!isNaN(messageModel.message.toLocaleLowerCase().trim())) {
          isValid = true
        }
        break
      case 'option-string':
        if (chatAction.validOptions && chatAction.validOptions.length) {
          payload = chatAction.validOptions.find(option => {
            // Regex for whole word in options, NOT CONTAINS
            const regex = new RegExp('\\b(' + option.key.toLocaleLowerCase().trim() + ')\\b', 'g')
            if (messageModel.message.toLocaleLowerCase().trim().match(regex)) {
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
