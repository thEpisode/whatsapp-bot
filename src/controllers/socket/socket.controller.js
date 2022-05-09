class SocketController {
  constructor (dependencies) {
    this._eventBus = dependencies.eventBus
    this._console = dependencies.console
    this._socket = dependencies.socket
    this._utilities = dependencies.utilities
    this._controllers = dependencies.controllers

    this._stakeholders = {
      node: { name: 'node' },
      server: { name: 'server' },
      client: { name: 'client' }
    }

    // This event is executed when socket is connected to node
    this._eventBus.on('initialize-event-engine', () => {
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
        this.#directActionHandler(payload, 'reversebytes.beat.api#node-response')
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
        this.#directActionHandler(payload, 'reversebytes.beat.api#server-request')
        break
      case 'gateway-message':
        this.#gatewayMessageHandler(payload)
        break
      default:
        break
    }
  }

  async #onClientEvent (payload) {
    switch (payload.context.type) {
      case 'direct-message':
        this.#directActionHandler(payload, 'reversebytes.beat.api#server-request')
        break
      case 'client-action':
        this.#clientActionHandler(payload)
        break
      default:
        break
    }
  }

  async #directActionHandler (payload, type) {
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

  async #gatewayMessageHandler (payload) {
    switch (payload.command) {
      case 'register-connection#request':
        this.#registerConnection(payload)
        break
      case 'getAllNodes#request':
        this.#getAllNodes(payload)
        break
      case 'example-gateway-command#request':
        this.#responseSuccess(payload)
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
      case 'start-session#request':
        this.#responseSuccess(payload)
        break
      case 'example-client#request':
        this.#responseSuccess(payload)
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
        this.#responseSuccess(payload)
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
    this.#responseSuccess(payload)
  }

  async #responseSuccess (payload) {
    if (!payload || !payload.context || !payload.context || !payload.context.sender) {
      return
    }

    payload.command = `${payload.command.split('#request')[0]}#response`
    payload.context.receiver = payload.context.sender
    this._socket.emit('reversebytes.beat.server', payload)
  }

  async #getAllNodes (payload) {
    const connectedSockets = await this._socket.fetchSockets()
    const nodes = connectedSockets.map(client => {
      if (client.nativeId) {
        connectedSockets.push({
          nativeId: client.nativeId,
          socketId: client.id,
          status: client.status || this._controllers.job.status.stopped
        })
      }
    })

    payload.values = { nodes }
    payload.context.receiver = payload.context.sender
    payload.command = `${payload.command.split('#request')[0]}#response`

    this.#directActionHandler(payload)
  }
}

module.exports = SocketController
