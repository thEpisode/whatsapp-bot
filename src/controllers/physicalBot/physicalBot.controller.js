const ClientController = require('../client/client.controller')
const puppeteer = require('puppeteer');
const fs = require('fs')

class PhysicalBotController {

  constructor ({ selectors, config, socket }) {
    this.selectors = selectors
    this.config = config
    this.socket = socket
  }

  async setupBrowser () {
    this.browser = await puppeteer.launch(this.config.browserOptions)

    this.loadClientScripts()
    return this.browser
  }

  updateConfig (config) {
    if (!config) {
      return
    }

    this.config = config
  }

  loadClientScripts () {
    this.scripts = this.config.scripts.whatsapp.map(script => {
      script['data'] = fs.readFileSync(script.path, 'utf8')
      return script
    })
  }

  async createBot () {
    this.bot = new ClientController({
      selectors: this.selectors,
      config: this.config,
      browser: this.browser,
      scripts: this.scripts,
      socket: this.socket
    })

    await this.bot.startEngine()
  }
}

module.exports = PhysicalBotController