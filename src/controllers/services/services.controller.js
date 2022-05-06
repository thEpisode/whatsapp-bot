class ServicesController {
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
    this._config = this._dependencies.config

    /* Assigments */
    /* this._newPrivateObject = new SomeObject(this._dependencies) */
  }

  async getBackendUri () {
    return this._utilities.response.success(this._config.BACKEND_URI || '/')
  }

  get status () {
    return this._models.Services.statuses
  }
}

module.exports = ServicesController
