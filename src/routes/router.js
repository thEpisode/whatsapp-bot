const router = {
  system: [
    { httpRoute: '/status', route: '/routes/api/status/status.route', handler: 'get', method: 'GET', protected: false },
    { httpRoute: '/services/backend-uri', route: '/routes/api/services/services.route', handler: 'getBackendUri', method: 'GET', protected: false }
  ],
  process: [
    { httpRoute: '/message', route: '/routes/api/process/process.route', handler: 'handleMessage', method: 'POST', protected: false }
  ]
}

module.exports = router
