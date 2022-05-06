class BackendController {
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
    this._auth = this._dependencies.auth
    this._request = this._dependencies.request

    /* Assigments */
    this._key = this._auth.crypto.generatePrivateKey(dependencies.config.BACKEND_SECRET)
  }

  async request (data) {
    if (!data || !data.url || typeof data.url !== 'string' || data.url.length <= 0) {
      return null
    }

    try {
      return await this.executeRequest(data)
    } catch (error) {
      console.log(error)
      return error
    }
  }

  executeRequest ({ url, method, body, headers }) {
    return this._request({
      url,
      method,
      data: body || {},
      headers
    })
  }

  get key () {
    return this._key
  }

  get status () {
    return this._models.Backend.statuses
  }
}

module.exports = BackendController
