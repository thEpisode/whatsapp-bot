const PhysicalBotController = require('../controllers/physicalBot/physicalBot.controller')
const socketClient = require('socket.io-client')
class ServerManager {

  constructor (config) {
    this.config = config
    this.socketConfig = this.config.SOCKET

    this.physicalBot = new PhysicalBotController({
      selectors: this.config.SELECTORS,
      config: {
        botKeyActions: this.config.BOT_KEY_ACTIONS,
        scripts: this.config.SCRIPTS,
        browserOptions: this.config.BROWSER_OPTIONS
      },
      socket: this.socketClient
    })

    this.physicalBot.setupBrowser().then(_ => {
      this.connectWS()
    })
  }

  connectWS () {
    let uri = this.config.SOCKET.port
      ? `${this.config.SOCKET.url}:${this.config.SOCKET.port}`
      : `${this.config.SOCKET.url}`
    this.socketClient = socketClient(uri)

    this.setupSocketEvents()

    this.physicalBot.createBot()
  }

  setupSocketSettings () {
    this.socketEventTypes = {
      botMessage: {
        name: 'botMessage'
      }
    }
    this.socketChannels = {
      ws: {
        name: 'ws'
      }
    }
  }

  setupSocketEvents () {
    this.setupSocketSettings()

    this.socketClient.on('reconnect_attempt', () => {
      this.socketClient.io.opts.transports = ['polling', 'websocket']
      _console.log(`Socket connect attempt`)
    })

    this.socketClient.on('connect', (param) => {
      if (!eventsIsInitialized) {
        _eventBus.emit('initializeEvents')
        eventsIsInitialized = true
      }

      // Register node into network
      this.socketClient.emit('reversebytes.gobot.physical#connect', {
        context: {
          channel: this.socketChannels.ws.name,
          type: this.socketEventTypes.botMessage.name,
          sender: { socketId: this.socketClient.id },
          nativeId: this.config.MACHINE_ID
        },
        command: 'registerNode#request',
        values: {}
      })

      _console.success(`Connected to ${this.config.SOCKET_URL}:${this.config.SOCKET_PORT} as ${this.socketClient.id} with native id ${this.config.MACHINE_ID}`)
    })

    this.socketClient.on('reversebytes.gobot.bot#EVENT', (data) => {
      _console.log('reversebytes.gobot.bot#EVENT')
      if (data.context.receiver.socketId === this.socketClient.id) {
        _console.log('Emitting serverEvent')
        _eventBus.emit(
          'onAdminEvent',
          {
            context: data.context || {},
            command: data.command || '',
            values: data.values || {}
          }
        )
      }
    })

    this.socketClient.on('disconnect', () => {
      _console.error(`Disconnected from ${this.config.SOCKET_URL}:${this.config.SOCKET_PORT}`)
    })
  }

  updatePhysical (config) {
    this.physicalBot.updateConfig(config)
  }
}

module.exports = ServerManager