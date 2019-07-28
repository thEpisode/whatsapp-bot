const ipc = require('electron').ipcRenderer
const BusinessController = require('../controllers/business/business.controller')

let business = {}

console.log('rendered loaded')

// Useful to send a message from backend
/* ipc.on('send-message', function (event, args) {
  sendMessage(args.userId, args.message)
}) */

/**
 * When bot is ready start the engine
 */
ipc.on('initialize-bot', (event, args) => {
  business = new BusinessController({
    ipc,
    messageTemplate: '._2UaNq',
    messageTemplates: [
      {
        id: 'echo',
        flow: [
          { message: `Hi!, welcome to *Virtual capital of America*` },
          { message: `at the moment I'm a chatbot without brain and my father is working hard to give me artificial intelligence` },
          { message: `if you are interested on my services please visit https://www.virtualcapitalofamerica.com.` },
          { message: `Your message: " _{{1}}_ "` }
        ]
      }]
  })
})

