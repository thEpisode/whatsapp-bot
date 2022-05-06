class PushManager {
  constructor (dependencies) {
    this._dependencies = dependencies
    this._console = dependencies.console
    this._push = {}
  }

  async loadPushNotifications () {
    switch (this._dependencies.config.PUSH_NAME) {
      case 'firebase':
        await this.firebaseConfig()
        break
      default:
        break
    }

    this._console.success('Push notification manager loaded')
  }

  async firebaseConfig () {
    try {
      this._push = this._dependencies.firebase.messaging()
    } catch (error) {
      console.log(error)
    }
  }

  get push () {
    return this._push
  }
}

module.exports = { PushManager }
