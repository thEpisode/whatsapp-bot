class SettingsManager {
  constructor (args) {
    this._args = args

    this.loadSettings()
  }

  loadSettings () {
    this.globalDependencies()
    this.languageExtensions()
    this.setupMiddlewares()
  }

  globalDependencies () {
    const { DependenciesManager } = require('./dependencies.manager')
    const { UtilitiesManager } = require('./utilities.manager')
    this._dependencies = new DependenciesManager(this._args)
    this._utilities = new UtilitiesManager(this._dependencies.core.get())

    this._dependencies.core.add(this._utilities, 'utilities')
    this._dependencies.core.add((str) => {
      try {
        JSON.parse(str)
      } catch (e) {
        return false
      }
      return true
    }, 'isJsonString')
  }

  stringIndexOfExtension () {
    // eslint-disable-next-line no-extend-native
    Object.defineProperty(String.prototype, 'regexIndexOf', {
      writable: false,
      enumerable: true,
      configurable: false,
      value: function (regex, startpos) {
        const indexOf = this.substring(startpos || 0).search(regex)
        return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf
      }
    })
  }

  stringLastIndexOfExtension () {
    // eslint-disable-next-line no-extend-native
    Object.defineProperty(String.prototype, 'regexLastIndexOf', {
      writable: false,
      enumerable: true,
      configurable: false,
      value: function (regex, startpos) {
        regex = (regex.global)
          ? regex
          : new RegExp(regex.source, 'g' + (regex.ignoreCase ? 'i' : '') + (regex.multiLine ? 'm' : ''))
        if (typeof (startpos) === 'undefined') {
          startpos = this.length
        } else if (startpos < 0) {
          startpos = 0
        }
        const stringToWorkWith = this.substring(0, startpos + 1)
        let lastIndexOf = -1
        let nextStop = 0
        let result = ''
        while ((result = regex.exec(stringToWorkWith)) != null) {
          lastIndexOf = result.index
          regex.lastIndex = ++nextStop
        }
        return lastIndexOf
      }
    })
  }

  stringReplaceAtExtension () {
    // eslint-disable-next-line no-extend-native
    Object.defineProperty(String.prototype, 'replaceAt', {
      writable: false,
      enumerable: true,
      configurable: false,
      value: function (index, replacement) {
        return this.substr(0, index) + replacement + this.substr(index + replacement.length)
      }
    })
  }

  stringReplaceAllExtension () {
    // eslint-disable-next-line no-extend-native
    Object.defineProperty(String.prototype, 'replaceAll', {
      writable: false,
      enumerable: true,
      configurable: false,
      value: function (search, replacement) {
        const target = this
        return target.replace(new RegExp(search, 'g'), replacement)
      }
    })
  }

  stringCapitalizeExtension () {
    // eslint-disable-next-line no-extend-native
    Object.defineProperty(String.prototype, 'capitalize', {
      writable: false,
      enumerable: true,
      configurable: false,
      value: function () {
        return this.replace(/\b\w/g, l => l.toUpperCase())
      }
    })
  }

  forEachExtension () {
    // eslint-disable-next-line no-extend-native
    Object.defineProperty(Array.prototype, 'asyncForEach', {
      writable: false,
      enumerable: true,
      configurable: false,
      value: async function (callback, thisArg) {
        thisArg = thisArg || {}
        for (let i = 0; i < this.length; i++) {
          await callback.call(thisArg, this[i], i, this)
        }
      }

    })
  }

  arrayFindExtension () {
    // eslint-disable-next-line no-extend-native
    Object.defineProperty(Array.prototype, 'find', {
      writable: false,
      enumerable: true,
      configurable: false,
      value: function (predicate) {
        // 1. Let O be ? ToObject(this value).
        if (this == null) {
          throw new TypeError('"this" is null or not defined')
        }

        const obj = Object(this)

        // 2. Let len be ? ToLength(? Get(O, "length")).
        const len = obj.length >>> 0

        // 3. If IsCallable(predicate) is false, throw a TypeError exception.
        if (typeof predicate !== 'function') {
          throw new TypeError('predicate must be a function')
        }

        // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
        const args = arguments[1]

        // 5. Let k be 0.
        let index = 0

        // 6. Repeat, while k < len
        while (index < len) {
          // a. Let Pk be ! ToString(k).
          // b. Let kValue be ? Get(O, Pk).
          // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
          // d. If testResult is true, return kValue.
          const indexValue = obj[index]
          if (predicate.call(args, indexValue, index, obj)) {
            return indexValue
          }
          // e. Increase k by 1.
          index++
        }

        // 7. Return undefined.
        return undefined
      }
    })
  }

  arrayFindIndexExtension () {
    // eslint-disable-next-line no-extend-native
    Object.defineProperty(Array.prototype, 'find', {
      writable: false,
      enumerable: true,
      configurable: false,
      value: function (fn) {
        if (this === null) {
          throw new TypeError('Array.prototype.findIndex called on null or undefined')
        }
        if (typeof fn !== 'function') {
          throw new TypeError('predicate must be a function')
        }

        const list = Object(this)
        const length = list.length >>> 0
        const args = arguments[1]
        let value = {}

        for (let i = 0; i < length; i++) {
          value = list[i]
          if (fn.call(args, value, i, list)) {
            return i
          }
        }
        return -1
      }
    })
  }

  languageExtensions () {
    if (!('asyncForEach' in Array.prototype)) {
      this.forEachExtension()
    }

    if (!('find' in Array.prototype)) {
      this.arrayFindExtension()
    }

    if (!('findIndex' in Array.prototype)) {
      this.arrayFindIndexExtension()
    }

    if (!('capitalize' in String.prototype)) {
      this.stringCapitalizeExtension()
    }

    if (!('regexIndexOf' in String.prototype)) {
      this.stringIndexOfExtension()
    }

    if (!('regexLastIndexOf' in String.prototype)) {
      this.stringLastIndexOfExtension()
    }

    if (!('replaceAt' in String.prototype)) {
      this.stringReplaceAtExtension()
    }

    if (!('replaceAll' in String.prototype)) {
      this.stringReplaceAllExtension()
    }

    console.log(` ${this._dependencies.core.get().colors.green(`${this._dependencies.core.get().config.SERVER_NAME}:`)} Language extended`)
  }

  setupMiddlewares () {
    // Security
    this._dependencies.core.get().express.use(this._dependencies.core.get().helmet())
    this._dependencies.core.get().express.disable('x-powered-by')
    this._dependencies.core.get().express.use(this._dependencies.core.get().compress())

    // use body parser so we can get info from POST and/or URL parameters
    this._dependencies.core.get().express.use(this._dependencies.core.get().bodyParser.urlencoded({ extended: true })) // support encoded bodies
    this._dependencies.core.get().express.use(this._dependencies.core.get().bodyParser.json()) // support json encoded bodies
    this._dependencies.core.get().express.use(this._dependencies.core.get().cors())
    this._dependencies.core.get().express.use(this._dependencies.core.get().cookieParser())

    console.log(` ${this._dependencies.core.get().colors.green(`${this._dependencies.core.get().config.SERVER_NAME}:`)} Configured middlewares`)
  }

  get dependencies () {
    return this._dependencies
  }
}

module.exports = { SettingsManager }
