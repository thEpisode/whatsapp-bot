const ipc = require('electron').ipcRenderer
const Bot = require('./src/controllers/bot.controller')

const conversationSelector = '._2UaNq'
let messageTemplate = `Welcome to *Virtual capital of America*, at this moment I haven't a brain and my father is working hard to give me artificial intelligence, if you are interested on my services please visit https://www.virtualcapitalofamerica.com. Your message: " _{{1}}_ "`;
let bot = {}

console.log('rendered loaded')

// Useful to send a message from backend
/* ipc.on('send-message', function (event, args) {
  sendMessage(args.userId, args.message)
}) */

/** 
 * Every second check if has any message unread, if is true return the same message
 */
ipc.on('start-echo', function (event, args) {
  setInterval(() => {
    let unreadChats = bot.getUnreadChats()

    if (unreadChats && unreadChats.length > 0) {
      unreadChats.map((chat) => {
        chat.messages.map((message) => {
          bot.sendMessage(chat.id, message.message)
        })
      })
    }
  }, 1000)
})

/**
 * When bot is ready start the engine
 */
ipc.on('initialize-bot', (event, args) => {
  bot = new Bot({ messageTemplate, conversationSelector })
  bot.startEngine()
})

