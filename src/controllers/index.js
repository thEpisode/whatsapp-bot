const AppController = require('./app/app.controller')
const AgentController = require('./agent/agent.Controller')
const BackendController = require('./backend/backend.Controller')
const ClientController = require('./client/client.Controller')
const ConversationController = require('./conversation/conversation.Controller')
const SocketController = require('./socket/socket.Controller')

module.exports = {
  AppController,
  AgentController,
  BackendController,
  ClientController,
  ConversationController,
  SocketController
}
