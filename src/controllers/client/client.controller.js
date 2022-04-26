const ConversationController = require('../conversation/conversation.controller')
var sizeof = require('object-sizeof')
const { Client, LocalAuth, List, Buttons } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal');

class ClientController {
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
    this.client = new Client();

    this.startEvents()
  }

  async startEvents () {
    this.client.on('qr', (qr) => {
      console.log('QR RECEIVED', qr);
      qrcode.generate(qr, { small: true });
    });

    this.client.on('ready', () => {
      console.log('Client is ready!');
    });

    this.client.on('message', async (message) => {
      const chat = await message.getChat()
      try {
        //console.log(msg)
        if (message.body == '!ping') {
          message.reply('pong');
        } else if (message.body == '!buttons') {
          let buttons = new Buttons("Button body", [{ body: "bt1" }, { body: "bt2" }, { body: "bt3" }], "title", "footer");
          chat.sendMessage('Sending buttons');
          chat.sendMessage(buttons);
        } else if (message.body == '!list') {
          let sections = [{ title: 'sectionTitle', rows: [{ id: 'customId', title: 'ListItem1', description: 'desc' }, { title: 'ListItem2' }] }];
          let list = new List('aaa', 'btnText', sections, 'Title', 'footer');
          chat.sendMessage('Sending list');
          chat.sendMessage(list);
        } else {
          const intentAction = await this.digestMessage(message, chat)

          this.sendIntentActionMessages(chat, intentAction)
        }
      } catch (error) {
        console.log(error)
      }

    });
    this.client.initialize();
  }

  findConversation (chat) {
    for (const conversation of this.conversations) {
      if (conversation.chat.id._serialized === chat.id._serialized) {
        return conversation
      }
    }

    return null
  }

  /**
   * Every second check if has any message unread, if is true return the same message
   */
  digestMessage (message, chat) {
    try {
      let conversation = this.findConversation(chat)

      if (conversation === null) {
        conversation = new ConversationController({
          chat,
          config: this.config
        })
        this.conversations.push(conversation)
      }

      return conversation.processMessage({ message })
    } catch (error) {
      console.log(error)
    }
  }

  sendIntentActionMessages (chat, intentAction) {
    for (const message of intentAction.messages) {
      chat.sendMessage(message.body)
    }
  }
}

module.exports = ClientController