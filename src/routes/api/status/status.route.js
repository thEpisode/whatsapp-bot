class StatusRoute {
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
   * Route to get status entity (GET http://<<URL>>/system/status)
   * @param {*} req Express request
   * @param {*} res Express response
   */
  async get (req, res) {
    const statusController = new this._controllers.StatusController(this._dependencies)
    const params = this._utilities.request.getParameters(req)
    let response = {}

    response = await statusController.get(params)

    res.json(response)
  }
}

module.exports = StatusRoute
