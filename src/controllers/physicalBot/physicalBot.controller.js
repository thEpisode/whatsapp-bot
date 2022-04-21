const ClientController = require('../client/client.controller')
const puppeteer = require('puppeteer');
const fs = require('fs')

class PhysicalBotController {

  constructor ({ selectors, config, socket }) {
    this.selectors = selectors
    this.config = config
    this.socket = socket
  }

  updateConfig (config) {
    if (!config) {
      return
    }

    this.config = config
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