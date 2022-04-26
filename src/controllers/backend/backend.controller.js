class BackendController {
  constructor (dependencies) {
    this._dependencies = dependencies
    this._request = this._dependencies.request
  }

   async request (data) {
    if (!data || !data.route || typeof data.route !== 'string' || data.route.length <= 0) {
      return null
    }

    try {
      const response = await this.doRequest(data)

      return response
    } catch (error) {
      console.log(error)
      return error
    }
  }

   async doRequest ({ route, method, parameters }) {
    return new Promise(function (resolve, reject) {
      this._request({
        method: method,
        uri: route,
        gzip: true,
        body: parameters || {},
        json: true,
      }, function (error, res, body) {
        if (!error && res.statusCode === 200) {
          resolve(body)
        } else {
          reject(error || body)
        }
      })
    })
  }

}

module.exports = BackendController
