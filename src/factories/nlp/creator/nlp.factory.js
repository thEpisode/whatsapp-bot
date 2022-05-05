const {
  AzureConcrete,
  AwsConcrete,
  GoogleConcrete,
  IbmConcrete,
} = require('../concretes/index')

class NlpFactory {
  constructor (dependencies) {
    if (!dependencies) {
      throw new Error('Required dependencies to build this factory')
    }

    this._dependencies = dependencies
    this._config = this._dependencies.config
    this._console = this._dependencies.console
    this._apps = this._dependencies.apps
    this._nlpEngineApp = this._apps.getAppByName({ name: 'nlp-engine' })
  }

  create () {
    const provider = this._nlpEngineApp.settings.provider

    this._concrete = null

    switch (provider) {
      case 'azure':
        this._concrete = new AzureConcrete(this._dependencies)
        break
      case 'google':
        this._concrete = new GoogleConcrete(this._dependencies)
        break
      case 'ibm':
        this._concrete = new IbmConcrete(this._dependencies)
        break
      case 'aws':
        this._concrete = new AwsConcrete(this._dependencies)
        break
      default:
        this._concrete = null
        break
    }

    this._concrete.provider = provider

    return this._concrete
  }

  get concrete () {
    return this._concrete
  }

  predict ({ message }) {
    return this._nlp.predict({ message })
  }
}

module.exports = NlpFactory