const ipc = require('electron').ipcRenderer
const config = require('config')
const BusinessController = require('../controllers/business/business.controller')

let business = {}

console.log('rendered.js loaded, chatbot will be loaded')

// Useful to send a message from backend
/* ipc.on('send-message', function (event, args) {
  sendMessage(args.userId, args.message)
}) */

/**
 * When bot is ready start the engine
 */
ipc.on('initialize-bot', (event, args) => {
  console.log(config.BUSINESS_KEY_ACTIONS)
  business = new BusinessController({
    ipc,
    conversationSelector: '._2UaNq',
    chatActions: config.BUSINESS_KEY_ACTIONS
  })
})

