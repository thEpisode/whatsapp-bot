class UtilitiesManager {
  constructor (dependencies) {
    this._dependencies = dependencies
    this._console = dependencies.console
    this._crypto = dependencies.crypto
  }

  /// Find an object dynamically by dot style
  /// E.g.
  /// var objExample = {employee: { firstname: "camilo", job:{name:"developer"}}}
  /// searchDotStyle(objExample, 'employee.job.name')
  searchDotStyle (obj, query) {
    return query.split('.').reduce((key, val) => key[val], obj)
  }

  idGenerator (length, prefix) {
    // Generate 256 random bytes and converted to hex to prevent failures on unscaped chars
    const buffer = this._crypto.randomBytes(256)
    const randomToken = buffer.toString('hex')
    // Generating of token
    return `${prefix || 'seed-'}${randomToken.slice(0, length)}`
  }

  propertyIsValid (property) {
    let isValid = false

    if (property && property.success === true) {
      isValid = true
    }

    return isValid
  }

  throwError (message) {
    if (message) {
      return { success: false, message: message, result: null }
    }

    return { success: false, message: 'Something was wrong while you make this action', result: null }
  }

  throwSuccess (data, message) {
    return {
      success: true,
      message: message || 'Operation completed successfully',
      result: data || {}
    }
  }

  badRequestView (_req, res, payload) {
    res.render('maintenance/maintenance.view.jsx', payload)
  }

  cleanObjectData (rawObj) {
    if (rawObj && rawObj.formatted) {
      return rawObj.formatted
    } else if (rawObj && rawObj.data) {
      return rawObj.data
    } else {
      return null
    }
  }

  // Search an object in a simple array
  findObject (query, _array) {
    return _array.find(function (element) {
      return element === query
    })
  }

  // Search an item by an object key
  findObjectByKey (query, key, _array) {
    return _array.find(function (element) {
      return element[key] === query
    })
  }

  findDeepObjectByKey (query, key, _array) {
    return _array.find(function (element) {
      const deepObject = this.searchDotStyle(element, key)
      return deepObject === query
    })
  }

  // Return index otherwise -1 is returned
  findIndexByKey (query, key, _array) {
    return _array.findIndex(function (element) {
      return element[key] === query
    })
  }

  // Return index otherwise -1 is returned
  findIndex (query, _array) {
    return _array.findIndex(function (element) {
      return element === query
    })
  }

  findAndRemove (query, _array) {
    const index = _array.findIndex(function (element) {
      return element === query
    })

    if (index > -1) {
      _array.splice(index, 1)
    }
    return index
  }

  findAndRemoveByKey (query, key, _array) {
    const index = _array.findIndex(function (element) {
      return element[key] === query
    })

    if (index > -1) {
      _array.splice(index, 1)
    }
    return index
  }

  serializerOjectToQueryString (obj, prefix) {
    if (obj && typeof obj === 'object') {
      const serializedArr = []
      let objKey = {}

      for (objKey in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, objKey)) {
          const key = prefix ? (prefix + '[' + objKey + ']') : objKey
          const value = obj[objKey] || null
          serializedArr.push((value !== null && typeof value === 'object')
            ? this.serializerOjectToQueryString(value, key)
            : encodeURIComponent(key) + '=' + encodeURIComponent(value))
        }
      }
      return serializedArr.join('&')
    }
  }

  objectToQueryString (obj) {
    if (obj && typeof obj === 'object') {
      const result = this.serializerOjectToQueryString(obj)
      return `?${result}`
    } else {
      return ''
    }
  }

  isEmpty (obj) {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        return false
      }
    }
    return true
  }

  getParameters (data) {
    if (!data) { return {} }

    let params = {}

    if (!this.isEmpty(data.query)) {
      params = { ...params, ...data.query }
    }
    if (!this.isEmpty(data.body)) {
      params = { ...params, ...data.body }
    }
    if (!this.isEmpty(data.params)) {
      params = { ...params, ...data.params }
    }

    return params
  }

  get objectIsEmpty () {
    return this.isEmpty.bind(this)
  }

  get serializer () {
    return {
      object: {
        toQueryString: this.objectToQueryString.bind(this)
      }
    }
  }

  get request () {
    return {
      getParameters: this.getParameters.bind(this)
    }
  }

  get response () {
    return {
      success: this.throwSuccess.bind(this),
      error: this.throwError.bind(this),
      badRequestView: this.badRequestView.bind(this),
      isValid: this.propertyIsValid.bind(this),
      clean: this.cleanObjectData.bind(this)
    }
  }

  get searchers () {
    return {
      object: {
        searchDotStyle: this.searchDotStyle.bind(this),
        findAndRemove: this.findAndRemoveByKey.bind(this),
        findIndex: this.findIndexByKey.bind(this),
        findObject: this.findObjectByKey.bind(this),
        findDeepObject: this.findDeepObjectByKey.bind(this)
      },
      array: {
        findAndRemove: this.findAndRemove.bind(this),
        findIndex: this.findIndex.bind(this),
        findObject: this.findObject.bind(this)
      }
    }
  }
}

module.exports = { UtilitiesManager }
