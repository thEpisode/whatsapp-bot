const PhysicalBotController = require('../controllers/physicalBot/physicalBot.controller')

class ServerManager {

  constructor (config) {
    this.socketConfig = config.SOCKET

    this.physicalBot = new PhysicalBotController({
      selectors: config.SELECTORS,
      config: {
        botKeyActions: config.BOT_KEY_ACTIONS,
        scripts: config.SCRIPTS,
        browserOptions: config.BROWSER_OPTIONS
      }
    })

    this.physicalBot.setupBrowser().then(_ => {
      this.connectWS()
    })
  }

  connectWS () {
    this.setupSocketEvents()

    this.physicalBot.createBot()
  }

  setupSocketEvents () {

  }

  updatePhysical (config) {
    this.physicalBot.updateConfig(config)
  }
}

module.exports = ServerManager