
const request = require('request')

function backendController() {
  const _request = async (data) => {
    if (!data || !data.route || typeof data.route !== 'string' || data.route.length <= 0) {
      return null
    }

    try {
      const response = await doRequest(data)

      return response
    } catch (error) {
      console.log(error)
      return error
    }
  }

  const doRequest = async ({ route, method, parameters }) => {
    return new Promise(function (resolve, reject) {
      request({
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

  return {
    request: _request
  }
}

module.exports = backendController
