class BackendController {
  constructor (dependencies) {
    this._dependencies = dependencies
    this._request = this._dependencies.request
  }

  async request (data) {
    if (!data || !data.url || typeof data.url !== 'string' || data.url.length <= 0) {
      return null
    }

    try {
      return await this.executeRequest(data)
    } catch (error) {
      console.log(error)
      return error
    }
  }

  executeRequest ({ url, method, body, headers }) {
      return this._request({
        url,
        method,
        data: body || {},
        headers
      })
  }
}

module.exports = BackendController
