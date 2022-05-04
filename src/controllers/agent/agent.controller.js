class AgentController {
  constructor (dependencies) {
    this._dependencies = dependencies
    this._config = this._dependencies.config
    this._socket = this._dependencies.socket
    this._controllers = this._dependencies.controllers
    this._client = null
    this._clientBots = null
    this._nlp = null
  }

  updateConfig (config) {
    if (!config) {
      return
    }

    this._config = config
  }

  async load () {
    this._clientBots = this._dependencies.config.BOTS
  }

  async setup () {
    this._client = new this._controllers.ClientController(this._dependencies, {
      bots: this._clientBots
    })
  }

  async start () {
    await this._client.startEngine()
  }
}

module.exports = AgentController
