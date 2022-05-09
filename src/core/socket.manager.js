class SocketManager {
  constructor (dependencies) {
    this._dependencies = dependencies
    this._console = dependencies.console
    this._socket = dependencies.socket
    this._eventBus = dependencies.eventBus
  }

  loadSocketEvents () {
    this._socket.on('connection', (client) => {
      client.on('reversebytes.beat.server', (data) => {
        this._eventBus.emit(
          'server-event',
          {
            context: data.context || {},
            command: data.command || '',
            values: data.values || {}
          }
        )
      })
      client.on('reversebytes.beat.chatbot', (data) => {
        this._eventBus.emit(
          'chatbot-event',
          {
            context: data.context || {},
            command: data.command || '',
            values: data.values || {}
          }
        )
      })
      client.on('reversebytes.beat.client', (data) => {
        this._eventBus.emit(
          'client-event',
          {
            context: data.context || {},
            command: data.command || '',
            values: data.values || {}
          }
        )
      })

      client.on('disconnect', () => {
        this._console.success(`Node disconnected ${client.id}`)
      })

      this._console.success(`Node connected ${client.id}`)
    })

    this._console.success('Socket manager loaded')
  }
}

module.exports = { SocketManager }
