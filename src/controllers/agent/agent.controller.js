class AgentController {
  constructor (dependencies) {
    /* Base Properties */
    this._dependencies = dependencies
    this._config = this._dependencies.config
    this._controllers = this._dependencies.controllers

    /* Custom Properties */
    this._eventBus = dependencies.eventBus

    /* Assigments */
    this._clients = []
  }

  async startEngine ({ data }) {
    let client = this.#getClientByUserId({ user: data.user.id })

    if (!client) {
      client = new this._controllers.ClientController(this._dependencies, {
        user: data.user
      })

      this._clients.push(client)
    }

    await client.startEngine()
  }

  #getClientByUserId ({ user }) {
    return this._clients.find(client => client.user.id === user.id)
  }
}

module.exports = AgentController
