const ClientController = require('../client/client.controller')
const backend = require('../backend/backend.controller')()
const utilities = require('../../core/utilities.manager')()
const puppeteer = require('puppeteer');
const fs = require('fs')

class PhysicalBotController {

  constructor ({ selectors, config }) {
    this.selectors = selectors
    this.config = config
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
    this.scripts = this.config.scripts.map(script => {
      script['data'] = fs.readFileSync(script.path, 'utf8')
      return script
    })
    var i = 0
  }

  async createBot () {
    this.bot = new ClientController({
      selectors: this.selectors,
      config: this.config,
      browser: this.browser,
      scripts: this.scripts
    })

    await this.bot.startEngine()
  }
}

module.exports = PhysicalBotController