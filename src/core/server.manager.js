const { SettingsManager } = require('./settings.manager')
const { ConsoleManager } = require('./console.manager')
class ServerManager {

  constructor (args) {
    this._settings = new SettingsManager(args)
    this._console = new ConsoleManager(this._settings.dependencies.core.get())
    this._controllers = null
  }

  start () {
    this.agent = new this._controllers.AgentController(this._settings.dependencies.core.get())
    this.agent.createBot()
    //this.connectWS()
  }

  async loadServer () {
    try {
      this.registerSettings()

      this.registerConsole()

      this.registerDal()

      this.socketSetup()

      this.registerModels()

      this.registerControllers()

      this.registerSocket()

      this.registerFunctions()

      this._console.success('Server manager loaded')

      this.executeStartupFunctions()

      return this._settings.dependencies.get()
    } catch (error) {
      console.log(error)
      process.exit()
    }
  }

  registerModels () {
    const { ModelManager } = require('./model.manager')
    const _modelsManager = new ModelManager(this._settings.dependencies.get())

    this._settings.dependencies.core.add(_modelsManager.models, 'models')
  }

  async registerDal () {
    const { DalManager } = require('./dal.manager')
    const _dalManager = new DalManager(this._settings.dependencies.get())

    this._settings.dependencies.core.add(_dalManager, 'dal')
  }

  registerSettings () {
    this._settings.dependencies.core.add(this._settings, 'settings')
  }

  registerConsole () {
    this._settings.dependencies.core.add(this._console, 'console')
  }

  registerControllers () {
    const { ControllerManager } = require('./controller.manager')
    const _controllersManager = new ControllerManager(this._settings.dependencies.get())

    this._settings.dependencies.core.add(_controllersManager.controllers, 'controllers')
    this._controllers = this._settings.dependencies.core.get().controllers
  }

  registerFunctions () {
    const { FunctionsManager } = require('./functions.manager')
    const _functionsManager = new FunctionsManager(this._settings.dependencies.get())

    this._settings.dependencies.core.add(_functionsManager.functions, 'functions')
  }

  socketSetup () {
    // Listening and setup socket
    // TODO: Improve this

    const { SocketManager } = require('./socket.manager')
    const _socketManager = new SocketManager(this._settings.dependencies.get())

    return _socketManager
  }

  registerSocket () {
    // Initialize socket when controllers are initialized
    const controllers = this._settings.dependencies.core.get().controllers
    const socketController = new controllers.SocketController(this._settings.dependencies.core.get())
    socketController.initialize()
  }

  executeStartupFunctions () {
    const functions = this._settings.dependencies.core.get().functions.startup
    for (const _function in functions) {
      functions[_function].run()
    }
  }

  normalizePort (val) {
    const port = parseInt(val, 10)

    if (isNaN(port)) return val
    if (port >= 0) return port

    return false
  }

  get settings () {
    return this._settings
  }

  connectWS () {
    this._config = this._settings.dependencies.core.get().config
    let uri = this._config.SOCKET.port
      ? `${this._config.SOCKET.url}:${this._config.SOCKET.port}`
      : `${this._config.SOCKET.url}`
    this.socketClient = this.socketClient(uri)

    //this.setupSocketEvents()

    
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
          nativeId: this._config.MACHINE_ID
        },
        command: 'registerNode#request',
        values: {}
      })

      console.log(`Connected to ${this._config.SOCKET.url}:${this._config.SOCKET.port} as ${this.socketClient.id} with native id ${this._config.MACHINE_ID}`)
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
      console.error(`Disconnected from ${this._config.SOCKET_URL}:${this._config.SOCKET_PORT}`)
    })
  }

  updatePhysical (config) {
    this.agent.updateConfig(config)
  }
}

module.exports = { ServerManager }