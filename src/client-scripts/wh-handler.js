class Utils {
  /**
     * Generate an await timeout
     * @param {Number} ms How many need to wait
     */
  timeout (ms) {
    return new Promise(resolve => window.setTimeout(resolve, ms))
  }

  /**
   * Return a pseudorandom number between boundaries
   * @param {Number} from Set the start of boundaries
   * @param {Number} to Set the end of boundaries
   */
  random (from, to) {
    return Math.floor(Math.random() * to) + from
  }

  /**
   * Simulate "Natural" click event workflow
   * @param {Object} node DOM element you want to trigger the event
   * @param {String} eventType Is the name of event you want to trigger
   */
  triggerMouseEvent (node, eventType) {
    if (!node) { return }

    let clickEvent = document.createEvent('MouseEvents')
    clickEvent.initEvent(eventType, true, true)
    node.dispatchEvent(clickEvent)
  }
}

class WhatsAppBus {
  constructor () {
    this.utils = new Utils()
  }
  /**
   * Useful to clean all unread conversations
   */
  openAllConversations () {
    var conversations = document.querySelectorAll(conversationSelector)
    conversations.forEach((conversation) => {
      this.utils.triggerMouseEvent(conversation, "mouseover")
      this.utils.triggerMouseEvent(conversation, "mousedown")
      this.utils.triggerMouseEvent(conversation, "mouseup")
      this.utils.triggerMouseEvent(conversation, "click")
    })
  }

  /**
   * To simulate "Human" behavior is important open the conversation
   * @param {String} name Is the contact name you want to open
   */
  openConversation (name) {
    let conversation = document.querySelector(`span[title="${name}"]`)

    // "Human" behavior
    this.utils.triggerMouseEvent(conversation, "mouseover")
    this.utils.triggerMouseEvent(conversation, "mousedown")
    this.utils.triggerMouseEvent(conversation, "mouseup")
    this.utils.triggerMouseEvent(conversation, "click")
  }


  /**
   * Send a message with "Human" behavior like state seen, online/offline, and more
   * @param {String} id Id serialized of conversation
   * @param {Object} chatAction Is a flow you want to execute in the messages
   */
  async sendMessage (id, chatAction) {
    if (!id) {
      return
    }

    chatAction = JSON.parse(chatAction)
    const chatsModels = Store.Chat.models
    const flow = chatAction.flow

    this.sendPresenceAvailable()

    let chatModel = chatsModels.find(chat => {
      return chat.__x_id._serialized.search(id) >= 0 && chat.__x_id._serialized.search('g.us') === -1
    })

    if (!chatModel) { return }

    let chat = {}
    chat.contact = chatModel.__x_formattedTitle
    chat.id = chatModel.__x_id._serialized
    chat.user = chatModel.__x_id.user

    // Clean coming message
    await this.utils.timeout(this.utils.random(300, 1000))
    this.openConversation(chat.contact)
    await this.sendChatStateSeen(chatModel)

    // Send to conversation "typing..." state
    await this.utils.timeout(this.utils.random(800, 2000))


    // Send the message
    for (const flowItem of flow) {
      this.sendChatstateComposing(chat.id)
      await this.utils.timeout(this.utils.random(500, flowItem.message.length * 80))
      //chatModel.sendMessage(message)
      // Also works
      Store.SendTextMsgToChat(chatModel, flowItem.message)

      // Stop the sending of conversation "typing..." state
      await this.utils.timeout(this.utils.random(300, 650))
      this.sendChatstatePaused(chat.id)
    }

    // Set offline state
    await this.utils.timeout(this.utils.random(300, 850))
    await this.sendChatStateSeen(chatModel)
    this.sendPresenceUnavailable()
  }

  /**
   * Set state of composing message (Typing...)
   * @param {String} chatIdSerialized Is the id serialized of conversation target
   */
  sendChatstateComposing (chatIdSerialized) {
    Store.WapQuery.sendChatstateComposing(chatIdSerialized)
  }

  /**
   * Set the state of stop typing
   * @param {String} chatIdSerialized Is the id serialized of conversation target
   */
  sendChatstatePaused (chatIdSerialized) {
    Store.WapQuery.sendChatstateComposing(chatIdSerialized)
  }

  /**
   * Set the state as available (online)
   */
  sendPresenceAvailable () {
    Store.WapQuery.sendPresenceAvailable()
  }

  /**
   * Set the state as unavailable (offline)
   */
  sendPresenceUnavailable () {
    Store.WapQuery.sendPresenceUnavailable()
  }

  /**
   * Set the state of messages are seen
   * @param {Object} chat Is a conversation
   * @param {Function} next Callback to notify process completition
   */
  async sendChatStateSeen (chat) {
    Store.WapQuery.sendStatusSeen(chat, false).then(() => { })
  }

  /**
   * Verify if is a real message, not notification, sent by me or user message
   * @param {Object} message Is the incoming message you want to validate
   */
  isChatMessage (message) {
    if (message.__x_isSentByMe) {
      return false
    }
    if (message.__x_isNotification) {
      return false
    }
    if (!message.__x_isUserCreatedType) {
      return false
    }
    return true
  }

  /**
   * Get all unread chats of Whatsapp
   */
  getUnreadChats () {
    if (!Store) { return [] }

    const chats = Store.Chat.models
    let output = []

    for (const chat in chats) {
      if (isNaN(chat)) {
        continue
      }

      let messages = chats[chat].msgs.models
      let unreadMessage = {}
      unreadMessage.contact = chats[chat].__x_formattedTitle || ''
      unreadMessage.id = chats[chat].__x_id._serialized || ''
      unreadMessage.user = chats[chat].__x_id.user || ''
      unreadMessage.messages = []

      for (let i = messages.length - 1; i >= 0; i--) {
        if (!messages[i].__x_isNewMsg) {
          break
        } else {
          if (!this.isChatMessage(messages[i])) {
            continue
          }

          messages[i].__x_isNewMsg = false
          unreadMessage.messages.push({
            message: messages[i].__x_body,
            timestamp: messages[i].__x_t,
            type: messages[i].__x_type,
            e: messages[i]
          })
        }
      }
      if (unreadMessage.messages.length > 0) {
        output.push(unreadMessage)
      }
    }

    return JSON.stringify(output)
  }

  /**
   * Return the chat you want
   * @param {String} id Id of chat
   * @param {Function} next Callback to notify found chat
   */
  getChat (id, next) {
    id = typeof id == "string" ? id : id._serialized
    const found = window.Store.Chat.get(id)

    if (next !== undefined) { next(found) }

    return found
  }
}

(() => {

  window.whatsAppBus = new WhatsAppBus()

})();
