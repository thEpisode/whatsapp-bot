class SocketController {
  constructor (dependencies) {
    /* Base Properties */
    this._dependencies = dependencies
    this._console = dependencies.console
    this._utilities = dependencies.utilities
    this._controllers = dependencies.controllers

    /* Custom Properties */
    this._socket = dependencies.socket
    this._eventBus = dependencies.eventBus

    /* Assigments */
    this._stakeholders = {
      node: { name: 'node' },
      server: { name: 'server' },
      client: { name: 'client' }
    }

    this._eventBus.on('initialize-event-engine', () => {
      // This event is executed when socket is connected to node
      this.initialize()
    })
  }

  initialize () {
    this.#eventSetup()
  }

  // Implement a selection for event
  #eventSetup () {
    this._eventBus.on('node-event', payload => { this.#channelHandler({ payload, stakeholder: this._stakeholders.node }) })

    this._eventBus.on('server-event', payload => { this.#channelHandler({ payload, stakeholder: this._stakeholders.server }) })

    this._eventBus.on('client-event', payload => { this.#channelHandler({ payload, stakeholder: this._stakeholders.client }) })
  }

  #channelHandler ({ payload, stakeholder }) {
    if (!payload || !payload.context) {
      this._console.error('Event is empty')
      return this._utilities.response.error('Please provide a context')
    }

    switch (payload.context.channel.toLocaleLowerCase().trim()) {
      case 'ws':
        this.#webSocketHandler({ payload, stakeholder })
        break
      case 'api':
        this.#apiHandler(payload, stakeholder)
        break
      default:
        break
    }
  }

  #webSocketHandler ({ payload, stakeholder }) {
    switch (stakeholder.name.toLocaleLowerCase().trim()) {
      case this._stakeholders.node.name.toLocaleLowerCase().trim():
        this.#onNodeEvent(payload)
        break
      case this._stakeholders.server.name.toLocaleLowerCase().trim():
        this.#onServerEvent(payload)
        break
      case this._stakeholders.client.name.toLocaleLowerCase().trim():
        this.#onClientEvent(payload)
        break
      default:
        break
    }
  }

  #apiHandler ({ payload }) {
    return this._utilities.response.success(payload)
  }

  async #onNodeEvent (payload) {
    switch (payload.context.type.toLocaleLowerCase()) {
      case 'direct-action':
        this.#directActionHandler('reversebytes.beat.api#node-response', payload)
        break
      case 'gateway-message':
        this.#nodeActionHandler(payload)
        break
      default:
        break
    }
  }

  async #onServerEvent (payload) {
    switch (payload.context.type.toLocaleLowerCase()) {
      case 'direct-message':
        this.#directActionHandler('reversebytes.beat.api#server-request', payload)
        break
      case 'internal-message':
        this.#internalMessageHandler(payload)
        break
      default:
        break
    }
  }

  async #onClientEvent (payload) {
    switch (payload.context.type) {
      case 'direct-message':
        this.#directActionHandler('reversebytes.beat.api#server-request', payload)
        break
      case 'client-action':
        this.#clientActionHandler(payload)
        break
      default:
        break
    }
  }

  async #directActionHandler (type, payload) {
    if (!payload || !payload.context || !payload.context.sender || !payload.context.sender.socketId) {
      return
    }

    if (!type) {
      return
    }

    const socket = this.#getSocketById({
      socketId: payload.context.sender.socketId
    })

    socket.emit(type, payload)
  }

  async #internalMessageHandler (payload) {
    switch (payload.command) {
      case 'create-agent#response':
        this.#emitEvent(payload)
        break
      case 'create-client#response':
        this.#emitEvent(payload)
        break
      case 'wh-client-qr#event':
        this.#emitEvent(payload)
        break
      case 'wh-client-qr-destroyed#event':
        this.#emitEvent(payload)
        break
      case 'wh-client-ready#event':
        this.#emitEvent(payload)
        break
      case 'conversation-message#event':
        this.#emitEvent(payload)
        break
      default:
        break
    }
  }

  async #clientActionHandler (payload) {
    switch (payload.command) {
      case 'register-connection#request':
        this.#registerConnection(payload)
        break
      case 'create-agent#request':
        this.#createAgent(payload)
        break
      case 'create-client#request':
        this.createClient(payload)
        break
      default:
        break
    }
  }

  async #nodeActionHandler (payload) {
    switch (payload.command) {
      case 'register-connection#request':
        this.#registerConnection(payload)
        break
      case 'example-node-command#response':
        this.#emitEvent(payload)
        break
      default:
        break
    }
  }

  async #getSocketById ({ socketId }) {
    const connectedSockets = await this._socket.fetchSockets()

    return connectedSockets.find(socket => socket.id === socketId)
  }

  async #registerConnection (payload) {
    if (!payload || !payload.context || !payload.context.sender || !payload.context.sender.socketId || !payload.context.nativeId) {
      return
    }

    const socket = await this.#getSocketById({
      socketId: payload.context.sender.socketId
    })

    if (!socket) {
      return
    }

    socket.nativeId = payload.context.nativeId
    this.#emitEvent(payload)
  }

  async #emitEvent (payload) {
    if (!payload || !payload.context || !payload.context || !payload.context.sender) {
      return
    }

    if (payload.command.includes('#request')) {
      payload.command = `${payload.command.split('#request')[0]}#response`
    }

    payload.context.receiver = payload.context.sender
    this._socket.emit('reversebytes.beat.server', payload)
  }

  #createAgent () {
    this._agent = new this._controllers.AgentController(this._dependencies)
    this._agent.load()
  }

  async createClient (payload) {
    const socket = await this.#getSocketById({
      socketId: payload.context.sender.socketId
    })

    this._agent.createClient({
      data: payload.values,
      socket
    })
  }
}

module.exports = SocketController
