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
    this._client = new this._controllers.ClientController(this._dependencies)
  }

  async start ({ data }) {
    await this._client.startEngine({ data })
  }
}

module.exports = AgentController
