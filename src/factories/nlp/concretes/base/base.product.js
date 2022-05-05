class BaseProduct {
  constructor (dependencies) {
    if (!dependencies) {
      throw new Error('Required dependencies to build this entity')
    }

    this._dependencies = dependencies
    this._config = this._dependencies.config
    this._console = this._dependencies.console
    this._controllers = this._dependencies.controllers
    this._backendController = new this._controllers.BackendController(this._dependencies)
    this._apps = this._dependencies.apps
    this._nlpEngineApp = this._apps.getAppByName({ name: 'nlp-engine' })
  }

  predict ({ message }) {
    try {
      return this._backendController.request({
        url: this._nlpEngineApp.settings.serviceUrl + this._nlpEngineApp.settings.serviceParameters + message.body,
        method: this._nlpEngineApp.settings.serviceMethod,
      })
    } catch (error) {
      this._console.error(error)
      console.log(error.stack)
    }

    return null
  }
}

module.exports = BaseProduct
