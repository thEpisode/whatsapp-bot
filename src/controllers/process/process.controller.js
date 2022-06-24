class ProcessController {
  constructor (dependencies) {
    /* Base Properties */
    this._dependencies = dependencies
    this._db = dependencies.db
    this._models = dependencies.models
    this._utilities = dependencies.utilities
    this._console = this._dependencies.console
    this._firebase = dependencies.firebaseManager
    this._controllers = this._dependencies.controllers

    /* Custom Properties */
    /* this._myPrivateProperty = 'Some value' */

    /* Assigments */
    /* this._newPrivateObject = new SomeObject(this._dependencies) */
  }

  async handleMessage (data) {
    try {
      this._agent = new this._controllers.AgentController(this._dependencies, data)
      this._agent.startSession()
      await this._agent.handleMessage(data)

      return this._utilities.response.success(data)
    } catch (error) {
      this._console.error(error)
      return this._utilities.response.error()
    }
  }
}

module.exports = ProcessController
