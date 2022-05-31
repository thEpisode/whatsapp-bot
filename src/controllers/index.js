const AppController = require('./app/app.controller')
const AgentController = require('./agent/agent.Controller')
const BackendController = require('./backend/backend.Controller')
const ClientController = require('./client/client.Controller')
const ConversationController = require('./conversation/conversation.controller')
const ProcessController = require('./process/process.controller')
const ServicesController = require('./services/services.controller')
const SocketController = require('./socket/socket.Controller')
const StatusController = require('./status/status.controller')

module.exports = {
  AppController,
  AgentController,
  BackendController,
  ClientController,
  ConversationController,
  ProcessController,
  ServicesController,
  SocketController,
  StatusController
}
