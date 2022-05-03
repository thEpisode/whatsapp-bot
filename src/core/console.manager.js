class ConsoleManager {
  constructor (dependencies) {
    this._dependencies = dependencies
    this._colors = dependencies.colors
    this._serverName = dependencies.config.AGENT_NAME
  }

  code (body) {
    console.log(this._colors.grey(' > ') + (this._dependencies.isJsonString(body) === true ? JSON.stringify(body) : body))
  }

  log (body) {
    console.log(this._dependencies.isJsonString(body) === true ? JSON.stringify(body) : body)
  }

  error (body) {
    console.log(` ${this._colors.red('Error')}: ${(this._dependencies.isJsonString(body) === true ? JSON.stringify(body) : body)}`)
  }

  info (body, title) {
    console.log(` ${this._colors.cyan(`${title || this._serverName}:`)} ${(this._dependencies.isJsonString(body) === true ? JSON.stringify(body) : body)}`)
  }

  warning (body, title) {
    console.log(` ${this._colors.yellow(`${title || this._serverName}:`)} ${(this._dependencies.isJsonString(body) === true ? JSON.stringify(body) : body)}`)
  }

  success (body, title) {
    console.log(` ${this._colors.green(`${title || this._serverName}:`)} ${(this._dependencies.isJsonString(body) === true ? JSON.stringify(body) : body)}`)
  }
}

module.exports = { ConsoleManager }
