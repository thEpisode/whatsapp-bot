const crypto = require('crypto')

function utilities() {
  const _crypto = crypto
  /// Find an object dynamically by dot style
  /// E.g.
  /// var objExample = {employee: { firstname: "camilo", job:{name:"developer"}}}
  /// searchDotStyle(objExample, 'employee.job.name')
  const searchDotStyle = (obj, query) => {
    return query.split('.').reduce((key, val) => key[val], obj)
  }

  const idGenerator = (length, prefix) => {
    // Generate 256 random bytes and converted to hex to prevent failures on unscaped chars
    const buffer = _crypto.randomBytes(256)
    const randomToken = buffer.toString('hex')
    // Generating of token
    return `${prefix || 'seed-'}${randomToken.slice(0, length)}`
  }

  const propertyIsValid = function (property) {
    let isValid = false

    if (property && property.success === true) {
      isValid = true
    }

    return isValid
  }

  const throwError = function (message) {
    if (message) {
      return { success: false, message: message, result: null }
    }

    return { success: false, message: 'Something was wrong while you make this action', result: null }
  }

  const throwSuccess = function (data, message) {
    const succesResponse = {
      success: true,
      message: message || 'Operation completed successfully',
      result: data || {}
    }

    return succesResponse
  }

  const badRequestView = function (req, res, data) {
    res.render('maintenance/index.view.jsx', data)
  }

  const cleanObjectData = rawObj => {
    if (rawObj && rawObj.formatted) {
      return rawObj.formatted
    } else if (rawObj && rawObj.data) {
      return rawObj.data
    } else {
      return null
    }
  }

  // Search an object in a simple array
  const findObject = (query, _array) => {
    return _array.find(function (element, index) {
      return element === query
    })
  }

  // Search an item by an object key
  const findObjectByKey = (query, key, _array) => {
    return _array.find(function (element, index) {
      return element[key] === query
    })
  }

  const findDeepObjectByKey = (query, key, _array) => {
    return _array.find(function (element, index) {
      const deepObject = searchDotStyle(element, key)
      return deepObject === query
    })
  }

  // Return index otherwise -1 is returned
  const findIndexByKey = (query, key, _array) => {
    return _array.findIndex(function (element, index) {
      return element[key] === query
    })
  }

  // Return index otherwise -1 is returned
  const findIndex = (query, _array) => {
    return _array.findIndex(function (element, index) {
      return element === query
    })
  }

  const findAndRemove = (query, _array) => {
    const index = _array.findIndex(function (element, index) {
      return element === query
    })

    if (index > -1) {
      _array.splice(index, 1)
    }
    return index
  }

  const findAndRemoveByKey = (query, key, _array) => {
    const index = _array.findIndex(function (element, index) {
      return element[key] === query
    })

    if (index > -1) {
      _array.splice(index, 1)
    }
    return index
  }

  const serializerOjectToQueryString = (obj, prefix) => {
    if (obj && typeof obj === 'object') {
      const serializedArr = []
      let key = {}

      for (key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const k = prefix ? prefix + '[' + key + ']' : key
          const value = obj[key] || null
          serializedArr.push((value !== null && typeof value === 'object')
            ? serializerOjectToQueryString(value, k)
            : encodeURIComponent(k) + '=' + encodeURIComponent(value))
        }
      }
      return serializedArr.join('&')
    }
  }

  const objectToQueryString = (obj) => {
    if (obj && typeof obj === 'object') {
      const result = serializerOjectToQueryString(obj)
      return `?${result}`
    } else {
      return ''
    }
  }

  const isEmpty = (obj) => {
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        return false
      }
    }
    return true
  }

  const getParameters = (data) => {
    if (!data) { return null }

    if (!isEmpty(data.query)) {
      return data.query
    } else if (!isEmpty(data.body)) {
      return data.body
    } else if (!isEmpty(data.params)) {
      return data.params
    } else {
      return null
    }
  }

  return {
    idGenerator: idGenerator,
    objectIsEmpty: isEmpty,
    serializer: {
      object: {
        toQueryString: objectToQueryString
      }
    },
    request: {
      getParameters
    },
    response: {
      success: throwSuccess,
      error: throwError,
      badRequestView: badRequestView,
      isValid: propertyIsValid,
      clean: cleanObjectData
    },
    searchers: {
      object: {
        searchDotStyle: searchDotStyle,
        findAndRemove: findAndRemoveByKey,
        findIndex: findIndexByKey,
        findObject: findObjectByKey,
        findDeepObject: findDeepObjectByKey
      },
      array: {
        findAndRemove: findAndRemove,
        findIndex: findIndex,
        findObject: findObject
      }
    }
  }
}

module.exports = utilities
