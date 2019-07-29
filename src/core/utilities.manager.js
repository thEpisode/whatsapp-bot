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
    let buffer = _crypto.randomBytes(256)
    let randomToken = buffer.toString('hex')
    // Generating of token
    return `${prefix || 'seed-'}${randomToken.slice(0, length)}`
  }

  const propertyIsValid = function (property) {
    if (property) {
      if (property.success === true) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }

  const throwError = function (message) {
    if (message) {
      return { success: false, message: message, result: null }
    } else {
      return { success: false, message: 'Something was wrong while you make this action', result: null }
    }
  }

  const throwSuccess = function (data, message) {
    if (message) {
      return {
        success: true,
        message: message,
        result: data
      }
    } else {
      return {
        success: true,
        message: 'Operation completed successfully',
        result: data
      }
    }
  }

  const badRequestView = function (req, res) {
    res.render('maintenance/maintenance.view.jsx', null)
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
      let deepObject = searchDotStyle(element, key)
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
    let index = _array.findIndex(function (element, index) {
      return element === query
    })

    if (index > -1) {
      _array.splice(index, 1)
    }
    return index
  }

  const findAndRemoveByKey = (query, key, _array) => {
    let index = _array.findIndex(function (element, index) {
      return element[key] === query
    })

    if (index > -1) {
      _array.splice(index, 1)
    }
    return index
  }

  const serializerOjectToQueryString = (obj, prefix) => {
    if (obj && typeof obj === 'object') {
      let str = []
      let p
      for (p in obj) {
        if (obj.hasOwnProperty(p)) {
          let k = prefix ? prefix + '[' + p + ']' : p
          let v = obj[p]
          str.push((v !== null && typeof v === 'object')
            ? serializerOjectToQueryString(v, k)
            : encodeURIComponent(k) + '=' + encodeURIComponent(v))
        }
      }
      return str.join('&')
    }
  }

  const objectToQueryString = (obj) => {
    if (obj && typeof obj === 'object') {
      let result = serializerOjectToQueryString(obj)
      return `?${result}`
    } else {
      return ''
    }
  }

  const isEmpty = (obj) => {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false
      }
    }
    return true
  }

  const getParameters = (data) => {
    if (!data) { return null }

    let params = {}

    if (!isEmpty(data.query)) {
      for (const key in data.query) {
        if (data.query.hasOwnProperty(key)) {
          const element = data.query[key]

          params[key] = element
        }
      }
    }

    if (!isEmpty(data.body)) {
      for (const key in data.body) {
        if (data.body.hasOwnProperty(key)) {
          const element = data.body[key]

          params[key] = element
        }
      }
    }

    if (!isEmpty(data.params)) {
      for (const key in data.params) {
        if (data.params.hasOwnProperty(key)) {
          const element = data.params[key]

          params[key] = element
        }
      }
    }

    return params
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
