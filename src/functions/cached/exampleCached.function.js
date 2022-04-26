function currenciesManagerFunction (dependencies) {
  /* Dependencies */
  const _console = dependencies.console

  /* Properties */
  let _status = {}

  /**
   * Cached function to handle data, in this example, _status
   * @param {any} data parameters to be handled in the function
   */
  const saveConcurrentData = async (data) => {
    if (data) {
      setCachedStatus(data)
    }
  }

  /**
   * Getter property function
   */
  const getCachedStatus = async () => {
    return _status
  }

  /**
   * Setter property function
   * @param {any} data is the new data to be saved
   */
  const setCachedStatus = async (data) => {
    if (!data) {
      return null
    }

    _status = data
    _console.success('status are setted succesfully')
  }

  return {
    saveConcurrentData,
    getCachedStatus,
    setCachedStatus
  }
}

module.exports = currenciesManagerFunction
