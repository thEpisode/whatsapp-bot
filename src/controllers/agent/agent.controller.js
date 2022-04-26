class AgentController {

  constructor (dependencies) {
    this._dependencies = dependencies
    this._config = this._dependencies.config
    this._socket = this._dependencies.socket
    this._controllers = this._dependencies.controllers
  }

  updateConfig (config) {
    if (!config) {
      return
    }

    this._config = config
  }

  async createBot () {
    this.bot = new this._controllers.ClientController(this._dependencies)

    await this.bot.startEngine()
  }
}

module.exports = AgentController