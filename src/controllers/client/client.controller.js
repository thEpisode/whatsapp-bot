const backend = require('../backend/backend.controller')
const utilities = require('../../core/utilities.manager')()

class BotController {
  constructor ({ selectors, config, browser, scripts, socket }) {
    this.selectors = selectors
    this.config = config
    this.browser = browser
    this.scripts = scripts
    this.socket = socket
  }

  /**
   * Initial point process
   */
  async startEngine () {
    await this.startSession()
  }

  async startSession () {
    this.context = await this.browser.createIncognitoBrowserContext()
    this.page = await this.context.newPage()

    await this.page.evaluateOnNewDocument(() => {
      window.navigator = {}
    })
    await this.page.goto('https://web.whatsapp.com')
    await this.page.waitForSelector(this.selectors.QRCODE, { visible: true })

    this.startEvents()
  }

  async startEvents () {
    this.page.exposeFunction('qrOnChange', (data) => {
      if (!data || !data.success) {
        return
      }

      console.log(`${data.message}`);
    })

    this.page.exposeFunction('chatOnLoaded', async (data) => {
      try {
        if (!data || !data.success) {
          return
        }

        console.log(data.message);

        /* Inject WhatsApp parasite */
        const whParasiteScript = utilities.searchers.object.findObject('parasite', 'name', this.scripts)
        await this.page.evaluate(whParasiteScript.data)

        /* Inject WhatsApp Handler */
        const whHandlerScript = utilities.searchers.object.findObject('wh-handler', 'name', this.scripts)
        await this.page.evaluate(whHandlerScript.data
          .replaceAll('conversationSelector', `'${this.selectors.CONVERSATIONITEM}'`))

        this.startListening()
      } catch (error) {
        console.log(error)
      }
    })

    /* Mutator for QR Code */
    const qrScript = utilities.searchers.object.findObject('qrSniffer', 'name', this.scripts)
    this.page.evaluate(qrScript.data
      .replaceAll('qrCodeSelector', `'${this.selectors.QRCODE}'`)
      .replaceAll('conversationSelector', `'${this.selectors.CONVERSATION}'`))
  }

  /**
   * Every second check if has any message unread, if is true return the same message
   */
  startListening () {
    setInterval(async () => {
      try {
        let unreadChats = await this.page.evaluate('window.whatsAppBus.getUnreadChats()')
        unreadChats = JSON.parse(unreadChats)

        if (unreadChats && unreadChats.length > 0) {
          console.log(unreadChats)
          unreadChats.map((chat) => {
            chat.messages.map((messageModel) => {
              this.messageHandler({ chat, messageModel })
            })
          })
        }
      } catch (error) {
        console.log(error)
      }
    }, 1000)
    console.log('Bot listening for incoming conversations')
  }

  async messageHandler ({ chat, messageModel }) {
    let chatAction = {}
    const keyIncidence = this.config.botKeyActions.find(action => {
      if (messageModel.message.toLocaleLowerCase().match(action.key.toLocaleLowerCase())) {
        return true
      } else {
        return false
      }
    })

    if (keyIncidence) {
      chatAction = JSON.parse(JSON.stringify(utilities.searchers.object.findObject(keyIncidence.id, 'id', this.config.botKeyActions)))
    } else {
      chatAction = JSON.parse(JSON.stringify(utilities.searchers.object.findObject('no-key', 'id', this.config.botKeyActions)))
    }

    if (!chatAction) {
      console.log(`No exist flow for this message: ${messageModel.message}`)
      return
    }

    if (chatAction.services && chatAction.services.preflight) {
      const response = await backend.request({
        route: chatAction.services.preflight.route,
        method: chatAction.services.preflight.method,
        parameters: { chat, messageModel }
      })

      if (!utilities.response.isValid(response)) {
        chatAction.flow = [{ message: response.message }]
      }
    }

    chatAction.flow.map(flowMessage => {
      flowMessage.message = flowMessage.message.replace('{{INCOMING_MESSAGE}}', messageModel.message)
      flowMessage.message = flowMessage.message.replace('{{INCOMING_PHONE}}', chat.user)
    })

    this.page.evaluate(`window.whatsAppBus.sendMessage('${chat.id}', '${JSON.stringify(chatAction)}')`)
  }
}

module.exports = BotController