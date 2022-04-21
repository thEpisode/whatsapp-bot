const ConversationController = require('../conversation/conversation.controller')
const utilities = require('../../core/utilities.manager')()
var sizeof = require('object-sizeof')
class BotController {
  constructor ({ selectors, config, browser, scripts, socket }) {
    this.selectors = selectors
    this.config = config
    this.browser = browser
    this.scripts = scripts
    this.socket = socket
    this.nextChatActionId = null
    this.conversations = []
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

        if (!unreadChats || !unreadChats.length) {
          return
        }

        console.log(unreadChats)
        unreadChats.map((chat) => {
          let conversation = this.conversations.find(conversation => conversation.id === chat.id)

          if (!conversation) {
            this.conversations.push({
              id: chat.id,
              user: chat.user,
              controller: new ConversationController({
                page: this.page,
                config: this.config
              })
            })
            conversation = this.conversations[this.conversations.length - 1]
          }
          conversation.controller.digestNewMessages(chat)
          console.log(sizeof(conversation))
        })
      } catch (error) {
        console.log(error)
      }
    }, 1000)
    console.log('Bot listening for incoming conversations')
  }
}

module.exports = BotController