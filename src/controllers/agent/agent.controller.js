class AgentController {
  constructor (dependencies) {
    /* Base Properties */
    this._dependencies = dependencies
    this._config = this._dependencies.config
    this._controllers = this._dependencies.controllers

    /* Custom Properties */
    this._eventBus = dependencies.eventBus
    this._socket = this._dependencies.socket

    /* Assigments */
    this._clients = []
  }

  #sendEvent (command, values) {
    const payload = {
      context: {
        channel: 'ws',
        type: 'internal-message',
        sender: { socketId: this._socket.id },
        nativeId: this._config.MACHINE_ID
      },
      command,
      values
    }

    this._eventBus.emit('server-event', payload)
  }

  load () {
    this.#sendEvent('create-agent#response', {})
  }

  async createClient ({ data, socket }) {
    let client = this.#getClientByUserId({ user: data.user.id })

    if (!client) {
      client = new this._controllers.ClientController(this._dependencies, {
        socket,
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
