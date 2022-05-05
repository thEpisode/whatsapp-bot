class AppController {
  constructor (dependencies) {
    this._dependencies = dependencies
    this._config = this._dependencies.config
    this._console = this._dependencies.console
    this._controllers = this._dependencies.controllers

    this._apps = []
  }

  loadApps ({ apps }) {
    this._apps = apps
  }

  getAppByName ({ name }) {
    if (!name) {
      throw new Error('Required name to search an app')
    }

    return this._apps.find(app => app.name.toLocaleLowerCase().trim() === name.toLocaleLowerCase().trim())
  }

  getAppById ({ id }) {
    if (!id) {
      throw new Error('Required id to search an app')
    }

    return this._apps.find(app => app.id.toLocaleLowerCase().trim() === id.toLocaleLowerCase().trim())
  }

  get apps () {
    return this._apps
  }
}

module.exports = AppController
