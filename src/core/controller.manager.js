class ControllerManager {
  constructor (dependencies) {
    this._dependencies = dependencies
    this._console = dependencies.console

    this.loadControllers()
  }

  loadControllers () {
    this._controllers = require(`${this._dependencies.root}/src/controllers/index`)

    this._console.success('Controllers manager loaded')
  }

  get controllers () {
    return this._controllers
  }
}

module.exports = { ControllerManager }
