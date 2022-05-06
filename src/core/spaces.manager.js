class SpacesManager {
  constructor (dependencies) {
    this._dependencies = dependencies
    this._console = dependencies.console
    this._credentials = ''
  }

  setSettings (credentials) {
    this.setCredentials(credentials)
    this._console.success('Spaces manager loaded')
  }

  getCredentials () {
    return this._credentials
  }

  setCredentials (credentials) {
    this._credentials = credentials
  }
}

module.exports = { SpacesManager }
