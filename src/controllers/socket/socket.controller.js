class SocketController {

  constructor (dependencies) {
    this._eventBus = dependencies.eventBus
    this._console = dependencies.console
    this._socket = dependencies.socket
    this._utilities = dependencies.utilities
    this._controllers = dependencies.controllers

    this._stackeholders = {
      node: { name: 'node' },
      admin: { name: 'admin' },
      client: { name: 'client' }
    }

    // This event is executed when socket is connected to node
    this._eventBus.on('initialize-event-engine', () => {
      initialize()
    })
  }

  async initialize () {
    await this.eventEngine()
  }

  // Implement a selection for event
  async eventEngine () {
    this._eventBus.on('node-event', payload => { this.channelHandler({ payload, stackeholder: this._stackeholders.node }) })

    this._eventBus.on('admin-event', payload => { this.channelHandler({ payload, stackeholder: this._stackeholders.admin }) })

    this._eventBus.on('client-event', payload => { this.channelHandler({ payload, stackeholder: this._stackeholders.client }) })
  }

  getSocketById ({ socketId }) {
    let socket = null

    for (const [key] of Object.entries(this._socket.sockets.connected)) {
      if (key === socketId) {
        socket = this._socket.sockets.connected[key]
        break
      }
    }

    return socket
  }

  async getFirstSocketByNativeId () {
    let nativeSocket = null

    for (const [key] of Object.entries(this._socket.sockets.connected)) {
      const client = this._socket.sockets.connected[key]
      if (client.nativeId) {
        nativeSocket = client
        break
      }
    }

    return nativeSocket
  }

  registerNode (data) {
    if (!data || !data.context || !data.context.sender || !data.context.sender.socketId || !data.context.nativeId) {
      return
    }

    const socket = getSocketById({
      socketId: data.context.sender.socketId
    })

    socket.nativeId = data.context.nativeId
  }

  async responseSuccess (data) {
    if (!data || !data.context || !data.context || !data.context.receiver) {
      return
    }

    this._socket.emit('reversebytes.beat.api', data)
  }

  async botRequest (data) {
    if (!data || !data.values || !data.context) {
      return
    }

    const socket = getFirstSocketByNativeId()

    data.context.receiver = {
      socketId: socket.id,
      nativeId: socket.nativeId
    }
    socket.emit('reversebytes.beat.api', data)
  }

  getAllNodes (data) {
    const nodes = []

    for (var key in this._socket.sockets.connected) {
      const client = this._socket.sockets.connected[key]

      if (client.nativeId) {
        nodes.push({
          nativeId: client.nativeId,
          socketId: client.id,
          status: client.status || this._controllers.job.status.stopped
        })
      }
    }

    data.values = { nodes: nodes }
    data.context.receiver = data.context.sender
    data.command = `${data.command.split('#request')[0]}#response`

    directActionHandler(data)
  }

  async nodeActionHandler (payload) {
    switch (payload.command) {
      case 'qr-bot#response':
      case 'create-bot#response':
      case 'qr-changed#response':
      case 'app-loaded#response':
        responseSuccess(payload)
        break
      case 'register-node#request':
        registerNode(payload)
        break
      default:
        break
    }
  }

  async clientActionHandler (payload) {
    switch (payload.command) {
      case 'create-bot#request':
      case 'qr-bot#request':
        botRequest(payload)
        break
      default:
        break
    }
  }

  async directActionHandler (data, type) {
    if (!data || !data.context || !data.context.sender || !data.context.sender.socketId) {
      return
    }

    if (!type) {
      return
    }

    const socket = getSocketById({
      socketId: data.context.sender.socketId
    })

    socket.emit(type, data)
  }

  async gatewayMessageHandler (payload) {
    switch (payload.command) {
      case 'getAllNodes#request':
        getAllNodes(payload)
        break
      case 'getCurrentJob#response':
      case 'stopCurrentJob#response':
      case 'restartCurrentJob#response':
      case 'scriptFinished#request':
        responseSuccess(payload)
        break
      default:
        break
    }
  }

  channelHandler ({ payload, stakeholder }) {
    if (!payload || !payload.context) {
      this._console.error('Event is empty')
      return this._utilities.response.error('Please provide a context')
    }

    switch (payload.context.channel.toLocaleLowerCase().trim()) {
      case 'ws':
        webSocketHandler({ payload, stakeholder })
        break
      case 'api':
        apiHandler(payload, stakeholder)
        break
      default:
        break
    }
  }

  webSocketHandler ({ payload, stakeholder }) {
    switch (stakeholder.name.toLocaleLowerCase().trim()) {
      case this._stackeholders.node.name.toLocaleLowerCase().trim():
        onNodeEvent(payload)
        break
      case this._stackeholders.admin.name.toLocaleLowerCase().trim():
        onAdminEvent(payload)
        break
      case this._stackeholders.client.name.toLocaleLowerCase().trim():
        onClientEvent(payload)
        break
      default:
        break
    }
  }

  apiHandler ({ payload }) {
    return this._utilities.response.success(payload)
  }

  async onNodeEvent (payload) {
    switch (payload.context.type.toLocaleLowerCase()) {
      case 'direct-action':
        directActionHandler(payload, 'reversebytes.beat.api#node-response')
        break
      case 'gateway-message':
        nodeActionHandler(payload)
        break
      case 'bot-action':
        nodeActionHandler(payload)
        break
      default:
        break
    }
  }

  async onAdminEvent (payload) {
    switch (payload.context.type.toLocaleLowerCase()) {
      case 'direct-message':
        directActionHandler(payload, 'reversebytes.beat.api#admin-request')
        break
      case 'gateway-message':
        gatewayMessageHandler(payload)
        break
      default:
        break
    }
  }

  async onClientEvent (payload) {
    switch (payload.context.type) {
      case 'direct-message':
        directActionHandler(payload, 'reversebytes.beat.api#admin-request')
        break
      case 'client-action':
        clientActionHandler(payload)
        break
      default:
        break
    }
  }

}

module.exports = SocketController
