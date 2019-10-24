/**
   * Generate an await timeout
   * @param {Number} ms How many need to wait
   */
const timeout = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Return a pseudorandom number between boundaries
 * @param {Number} from Set the start of boundaries
 * @param {Number} to Set the end of boundaries
 */
const random = (from, to) => {
  return Math.floor(Math.random() * to) + from
}

/**
 * Send a message to main.js notifying is ready to use
 */
const whatsappIsReady = () => {
  // Return to code-behind telling whatsapp is ready to work
  this.ipc.send('whatsapp-is-ready')
}

/**
 * Useful to clean all unread conversations
 */
const openAllConversations = () => {
  var conversations = document.querySelectorAll(conversationSelector)
  conversations.forEach((conversation) => {
    this.triggerMouseEvent(conversation, "mouseover")
    this.triggerMouseEvent(conversation, "mousedown")
    this.triggerMouseEvent(conversation, "mouseup")
    this.triggerMouseEvent(conversation, "click")
  })
}

/**
 * To simulate "Human" behavior is important open the conversation
 * @param {String} name Is the contact name you want to open
 */
const openConversation = (name) => {
  let conversation = document.querySelector(`span[title="${name}"]`)

  // "Human" behavior
  this.triggerMouseEvent(conversation, "mouseover")
  this.triggerMouseEvent(conversation, "mousedown")
  this.triggerMouseEvent(conversation, "mouseup")
  this.triggerMouseEvent(conversation, "click")
}

/**
 * Simulate "Natural" click event workflow
 * @param {Object} node DOM element you want to trigger the event
 * @param {String} eventType Is the name of event you want to trigger
 */
const triggerMouseEvent = (node, eventType) => {
  if (!node) { return }

  let clickEvent = document.createEvent('MouseEvents')
  clickEvent.initEvent(eventType, true, true)
  node.dispatchEvent(clickEvent)
}

/**
 * Send a message with "Human" behavior like state seen, online/offline, and more
 * @param {String} id Id serialized of conversation
 * @param {Object} chatAction Is a flow you want to execute in the messages
 */
const sendMessage = async (id, chatAction) => {
  if (!id) {
    return
  }

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
  await this.timeout(this.random(300, 1000))
  this.openConversation(chat.contact)
  this.sendChatStateSeen(chatModel)

  // Send to conversation "typing..." state
  await this.timeout(this.random(800, 2000))


  // Send the message
  for (const flowItem of flow) {
    this.sendChatstateComposing(chat.id)
    await this.timeout(this.random(500, flowItem.message.length * 80))
    //chatModel.sendMessage(message)
    // Also works
    Store.SendTextMsgToChat(chatModel, flowItem.message)

    // Stop the sending of conversation "typing..." state
    await this.timeout(this.random(300, 650))
    this.sendChatstatePaused(chat.id)
  }

  // Set offline state
  await this.timeout(this.random(300, 850))
  this.sendChatStateSeen(chatModel)
  this.sendPresenceUnavailable()
}

/**
 * Set state of composing message (Typing...)
 * @param {String} chatIdSerialized Is the id serialized of conversation target
 */
const sendChatstateComposing = (chatIdSerialized) => {
  Store.WapQuery.sendChatstateComposing(chatIdSerialized)
}

/**
 * Set the state of stop typing
 * @param {String} chatIdSerialized Is the id serialized of conversation target
 */
const sendChatstatePaused = (chatIdSerialized) => {
  Store.WapQuery.sendChatstateComposing(chatIdSerialized)
}

/**
 * Set the state as available (online)
 */
const sendPresenceAvailable = () => {
  Store.WapQuery.sendPresenceAvailable()
}

/**
 * Set the state as unavailable (offline)
 */
const sendPresenceUnavailable = () => {
  Store.WapQuery.sendPresenceUnavailable()
}

/**
 * Set the state of messages are seen
 * @param {Object} chat Is a conversation
 * @param {Function} next Callback to notify process completition
 */
const sendChatStateSeen = (chat, next) => {
  Store.WapQuery.sendStatusSeen(chat, true).then(() => {
    next(true)
  })
}

/**
 * Verify if is a real message, not notification, sent by me or user message
 * @param {Object} message Is the incoming message you want to validate
 */
const isChatMessage = (message) => {
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
const getUnreadChats = () => {
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

  return output
}

/**
 * Return the chat you want
 * @param {String} id Id of chat
 * @param {Function} next Callback to notify found chat
 */
const getChat = (id, next) => {
  id = typeof id == "string" ? id : id._serialized
  const found = window.Store.Chat.get(id)

  if (next !== undefined) { next(found) }

  return found
}