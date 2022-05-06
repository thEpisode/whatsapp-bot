class ServicesRoute {
  constructor (dependencies) {
    /* Base Properties */
    this._dependencies = dependencies
    this._utilities = this._dependencies.utilities
    this._controllers = this._dependencies.controllers

    /* Custom Properties */
    /* this._myPrivateProperty = 'Some value' */

    /* Assigments */
    /* this._newPrivateObject = new SomeObject(this._dependencies) */
  }

  /**
   * Route to get status entity (GET http://<<URL>>/services/backend-uri)
   * @param {*} req Express request
   * @param {*} res Express response
   */
  async getBackendUri (req, res) {
    const servicesController = new this._controllers.ServicesController(this._dependencies)
    const params = this._utilities.request.getParameters(req)
    let response = {}

    response = await servicesController.getBackendUri(params)

    res.json(response)
  }
}

module.exports = ServicesRoute
