class ApiManager {
  constructor (dependencies) {
    this._dependencies = dependencies
    this._console = dependencies.console
    this._app = dependencies.express
    this._express = dependencies.expressModule
    this._auth = dependencies.auth
    this._storage = dependencies.storage
    this._apiRoutes = this._express.Router()
    this._path = dependencies.path

    this.createEndpoints()

    this._console.success('API manager loaded')
  }

  handleGetMethod (route, domain, endpoint) {
    if (endpoint.protected) {
      this._apiRoutes.get(`/${domain}${endpoint.httpRoute}`, this._auth.middleware.validateApi, (req, res) => route[endpoint.handler](req, res))
    } else {
      this._apiRoutes.get(`/${domain}${endpoint.httpRoute}`, (req, res) => route[endpoint.handler](req, res))
    }
  }

  handlePostMethod (route, domain, endpoint) {
    if (endpoint.isUpload && this._storage) {
      this._apiRoutes.post(`/${domain}${endpoint.httpRoute}`, this._storage.single('file'), (req, res) => route[endpoint.handler](req, res))
      return
    }

    if (endpoint.protected) {
      this._apiRoutes.post(`/${domain}${endpoint.httpRoute}`, this._auth.middleware.validateApi, (req, res) => route[endpoint.handler](req, res))
    } else {
      this._apiRoutes.post(`/${domain}${endpoint.httpRoute}`, (req, res) => route[endpoint.handler](req, res))
    }
  }

  handlePutMethod (route, domain, endpoint) {
    if (endpoint.protected) {
      this._apiRoutes.put(`/${domain}${endpoint.httpRoute}`, this._auth.middleware.validateApi, (req, res) => route[endpoint.handler](req, res))
    } else {
      this._apiRoutes.put(`/${domain}${endpoint.httpRoute}`, (req, res) => route[endpoint.handler](req, res))
    }
  }

  handlePatchMethod (route, domain, endpoint) {
    if (endpoint.protected) {
      this._apiRoutes.patch(`/${domain}${endpoint.httpRoute}`, this._auth.middleware.validateApi, (req, res) => route[endpoint.handler](req, res))
    } else {
      this._apiRoutes.patch(`/${domain}${endpoint.httpRoute}`, (req, res) => route[endpoint.handler](req, res))
    }
  }

  handleDeleteMethod (route, domain, endpoint) {
    if (endpoint.protected) {
      this._apiRoutes.delete(`/${domain}${endpoint.httpRoute}`, this._auth.middleware.validateApi, (req, res) => route[endpoint.handler](req, res))
    } else {
      this._apiRoutes.delete(`/${domain}${endpoint.httpRoute}`, (req, res) => route[endpoint.handler](req, res))
    }
  }

  createEndpoints () {
    const router = require(this._path.join(this._dependencies.root, 'src', 'routes', 'router'))

    // build each api routes
    for (const domainName in router) {
      if (Object.hasOwnProperty.call(router, domainName)) {
        const domain = router[domainName]

        domain.map((endpoint) => {
          try {
            const Route = require(this._path.join(this._dependencies.root, `src/${endpoint.route}`))
            switch (endpoint.method.toLocaleUpperCase()) {
              case 'GET':
                this.handleGetMethod(new Route(this._dependencies), domainName, endpoint)
                break
              case 'POST':
                this.handlePostMethod(new Route(this._dependencies), domainName, endpoint)
                break
              case 'PUT':
                this.handlePutMethod(new Route(this._dependencies), domainName, endpoint)
                break
              case 'PATCH':
                this.handlePatchMethod(new Route(this._dependencies), domainName, endpoint)
                break
              case 'DELETE':
                this.handleDeleteMethod(new Route(this._dependencies), domainName, endpoint)
                break
              default:
                break
            }
          } catch (error) {
            this._console.error(`Endpoint failed: ${JSON.stringify(endpoint)}`, true)
          }
        })
      }
    }

    // apply the routes to our application with the prefix /api
    this._app.use('/', this._apiRoutes)

    // Something else route response a 404 error
    this._apiRoutes.get('*', (_req, res) => {
      res.status(404).send('This API is not fully armed and operational... Try another valid route.')
    })
  }
}

module.exports = { ApiManager }
