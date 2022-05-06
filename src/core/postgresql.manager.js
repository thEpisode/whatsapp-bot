class PostgresqlManager {
  constructor (dependencies) {
    this._dependencies = dependencies
    this._console = dependencies.console
    this._credentials = ''
  }

  setSettings () {
    this.setCredentials(this._dependencies.config.POSTGRESQL)

    this._console.success('PostgreSQL manager loaded')
  }

  getCredentials () {
    return this._credentials
  }

  setCredentials (credentials) {
    this._credentials = credentials
  }
}

module.exports = { PostgresqlManager }
