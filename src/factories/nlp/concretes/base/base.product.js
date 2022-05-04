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
    this._nlp = this._config.NLP
  }

  predict ({ message }) {
    try {
      return this._backendController.request({
        url: this._nlp.serviceUrl + this._nlp.serviceParameters + message.body,
        method: this._nlp.serviceMethod,
      })
    } catch (error) {
      this._console.error(error)
      console.log(error.stack)
    }

    return null
  }
}

module.exports = BaseProduct
