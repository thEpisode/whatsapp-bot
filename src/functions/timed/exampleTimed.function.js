function closedMarketsFunction (dependencies) {
  /* Dependencies */
  const _console = dependencies.console
  const _controllers = dependencies.controllers
  const _utilities = dependencies.utilities

  const runEvery24H = async (data) => {
    try {
      _console.info('Executing runEvery24H function')

      const statusResponse = await _controllers.status.get()

      if (_utilities.response.isValid(statusResponse)) {
        // dependencies.functions.cached.currenciesManager.saveConcurrentData(statusResponse.result)
      }
    } catch (error) {
      _console.error(error)
    }
  }

  return {
    runEvery24H
  }
}

module.exports = closedMarketsFunction
