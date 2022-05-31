class ConsoleManager {
  constructor (dependencies) {
    this._dependencies = dependencies
    this._colors = dependencies.colors
    this._serverName = dependencies.config.SERVER_NAME
  }

  code (body) {
    console.log(this._colors.grey(' > ') + (this._dependencies.isJsonString(body) === true ? JSON.stringify(body) : body))
  }

  log (body) {
    console.log(this._dependencies.isJsonString(body) === true ? JSON.stringify(body) : body)
  }

  error (body) {
    console.log(` ${this._colors.red('Error')}:`, body)
  }

  info (body, title) {
    title = (title || this._serverName) + ':'
    console.log(` ${this._colors.cyan(title)}`, body)
  }

  warning (body, title) {
    title = (title || this._serverName) + ':'
    console.log(` ${this._colors.yellow(title)}`, body)
  }

  success (body, title) {
    title = (title || this._serverName) + ':'
    console.log(` ${this._colors.green(title)}`, body)
  }
}

module.exports = { ConsoleManager }
