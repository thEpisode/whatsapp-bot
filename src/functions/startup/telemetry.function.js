function telemetryFunction (dependencies) {
  /* Dependencies */
  const _console = dependencies.console

  const run = async (data) => {
    telemetry()
  }

  const telemetry = async (data) => {
    try {
      _console.info('Executing telemetry function')

      // TODO: Develop your code
    } catch (error) {
      _console.error(error)
    }
  }

  return {
    run,
    telemetry
  }
}

module.exports = telemetryFunction
