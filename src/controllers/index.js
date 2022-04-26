const AgentController = require('./agent/agent.Controller')
const BackendController = require('./backend/backend.Controller')
const ClientController = require('./client/client.Controller')
const ConversationController = require('./conversation/conversation.Controller')
const SocketController = require('./socket/socket.Controller')


module.exports = {
  AgentController,
  BackendController,
  ClientController,
  ConversationController,
  SocketController
}