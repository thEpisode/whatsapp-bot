const PhysicalBotController = require('../controllers/physicalBot/physicalBot.controller')
const socketClient = require('socket.io-client')
class ServerManager {

  constructor ({ config, eventBus }) {
    this.eventBus = eventBus
    this.config = config
    this.socketConfig = this.config.SOCKET
    this.eventsIsInitialized = false

    this.physicalBot = new PhysicalBotController({
      selectors: this.config.SELECTORS,
      config: {
        botKeyActions: this.config.BOT_KEY_ACTIONS,
        scripts: this.config.SCRIPTS,
        browserOptions: this.config.BROWSER_OPTIONS,
        botType: this.config.BOT_TYPE
      },
      socket: this.socketClient
    })

    this.connectWS()
  }

  connectWS () {
    let uri = this.config.SOCKET.port
      ? `${this.config.SOCKET.url}:${this.config.SOCKET.port}`
      : `${this.config.SOCKET.url}`
    this.socketClient = socketClient(uri)

    //this.setupSocketEvents()

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
      console.log(`Socket connect attempt`)
    })

    this.socketClient.on('connect', (param) => {
      if (!this.eventsIsInitialized) {
        this.eventBus.emit('initializeEvents')
        this.eventsIsInitialized = true
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

      console.log(`Connected to ${this.config.SOCKET.url}:${this.config.SOCKET.port} as ${this.socketClient.id} with native id ${this.config.MACHINE_ID}`)
    })

    this.socketClient.on('reversebytes.gobot.bot#EVENT', (data) => {
      console.log('reversebytes.gobot.bot#EVENT')
      if (data.context.receiver.socketId === this.socketClient.id) {
        console.log('Emitting serverEvent')
        this.eventBus.emit(
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
      console.error(`Disconnected from ${this.config.SOCKET_URL}:${this.config.SOCKET_PORT}`)
    })
  }

  updatePhysical (config) {
    this.physicalBot.updateConfig(config)
  }
}

module.exports = ServerManager