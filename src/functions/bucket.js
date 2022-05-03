const functions = {
  cached: [
    { name: 'saveConcurrentData', route: '/functions/cached/exampleCached.function', storage: 'RAM', expire: 'never' }
  ],
  timed: [
    { name: 'runEvery24H', route: '/functions/timed/exampleTimed.function', startAt: '23:59:59', intervalTime: '24', intervalMeasure: 'hours' }
  ],
  startup: [
    { name: 'telemetry', route: '/functions/startup/telemetry.function' }
  ]
}

module.exports = functions
