class ModelManager {
  constructor (dependencies) {
    this._dependencies = dependencies
    this._console = dependencies.console

    this.loadModels()
  }

  loadModels () {
    this._models = require(`${this._dependencies.root}/src/models/index`)

    this._console.success('Models manager loaded')
  }

  get models () {
    return this._models
  }
}

module.exports = { ModelManager }
