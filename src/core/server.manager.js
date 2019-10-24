const PhysicalBotController = require('../controllers/physicalBot/physicalBot.controller')

class ServerManager {

  constructor (config) {
    this.socketConfig = config.SOCKET

    this.business = new PhysicalBotController({
      selectors: config.SELECTORS,
      config: {
        scripts: config.SCRIPTS,
        browserOptions: config.BROWSER_OPTIONS
      }
    })

    this.connectWS()
  }

  connectWS () {
    this.setupSocketEvents()
  }

  setupSocketEvents () {

  }

  configureBusiness (config) {
    this.business.updateConfig(config)
  }
}

module.exports = ServerManager