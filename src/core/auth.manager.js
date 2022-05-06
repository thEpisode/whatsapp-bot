class AuthManager {
  constructor (dependencies) {
    this._dependencies = dependencies
    this._console = dependencies.console
    this._bcrypt = dependencies.bcrypt
    this._jwt = dependencies.jwt
    this._utilities = dependencies.utilities
    this._aesjs = dependencies.aesjs
    this._crypto = dependencies.crypto
  }

  generatePrivateKey (seed) {
    // Get a 32 bit hash from given seed
    const hashString = this._crypto
      .createHash('sha256')
      .update(seed || '', 'utf8')
      .digest('hex')
      .slice(0, 32)
    // Cast the string to a array buffer
    const hashBuffer = Uint8Array.from(hashString, (x) => x.charCodeAt(0))
    // Cast array buffer to array int
    return [...hashBuffer]
  }

  cypherObject (key, payload) {
    try {
      if (!payload || (typeof payload !== 'object' && typeof payload !== 'string')) {
        return null
      }

      // Convert data to bytes
      const dataBytes = this._aesjs.utils.utf8.toBytes(JSON.stringify(payload))

      // Turns a block cipher into a stream cipher. It generates the next keystream
      // block by encrypting successive values of a "counter"
      const aesCTR = new this._aesjs.ModeOfOperation.ctr(key, new this._aesjs.Counter(5))
      const encryptedBytes = aesCTR.encrypt(dataBytes)

      // convert bytes it to hex, is to handle in Key Vault Network
      const encryptedHex = this._aesjs.utils.hex.fromBytes(encryptedBytes)

      return encryptedHex
    } catch (error) {
      this._console.error(error)
      return null
    }
  }

  decipherObject (key, payload) {
    try {
      if (!payload || typeof payload !== 'string') {
        return null
      }

      // When ready to decrypt the hex string, convert it back to bytes
      const encryptedBytes = this._aesjs.utils.hex.toBytes(payload)

      // The counter mode of operation maintains internal state, so to
      // decrypt a new instance must be instantiated.
      /* eslint new-cap: ["error", { "properties": false }] */
      const aesCtr = new this._aesjs.ModeOfOperation.ctr(key, new this._aesjs.Counter(5))
      const decryptedBytes = aesCtr.decrypt(encryptedBytes)

      // Convert our bytes back into text
      const decryptedText = this._aesjs.utils.utf8.fromBytes(decryptedBytes)

      return JSON.parse(decryptedText)
    } catch (error) {
      this._console.error(error)
      return null
    }
  }

  stringToHash (payload) {
    if (!payload || typeof payload !== 'string') {
      return null
    }

    return this._bcrypt.hashSync(payload, 8)
  }

  destroyToken () {
    return { auth: false, token: null }
  }

  createToken (data, payload) {
    try {
      if (!data || !payload) {
        return null
      }

      const token = this._jwt.sign(data, this._dependencies.config.JWT_SECRET, {
        expiresIn: this._dependencies.config.TOKEN_EXPIRE * 3600
      })

      return { userId: data.userId, auth: true, token, payload }
    } catch (error) {
      this._console.error(error)
      return null
    }
  }

  validateToken (token) {
    return new Promise((resolve, reject) => {
      this._jwt.verify(token, this._dependencies.config.JWT_SECRET, (err, decoded) => {
        if (err) {
          return reject(err)
        } else {
          resolve(decoded)
        }
      })
    })
  }

  async validateApi (req, res, next) {
    try {
      const _controllers = this._dependencies.controllers
      // check header or url parameters or post parameters for token
      const encryptedToken = req.body.token || req.query.token || req.headers['x-access-token']

      // exist token
      if (!encryptedToken) {
        // if there is no token return an error
        return res.status(403).json(this._utilities.response.error('No token provided.'))
      }

      const decipherToken = this.decipherObject(_controllers.backend.key, encryptedToken)

      if (!decipherToken || !decipherToken.token) {
        return res.status(403).json(this._utilities.response.error('Malformed token. Try with a valid token'))
      }

      const decoded = await this.validateToken(decipherToken.token)
      req.decodedToken = decoded
      req.token = encryptedToken

      next()
    } catch (error) {
      return res.status(403).json(this._utilities.response.error('Failed to authenticate token.'))
    }
  }

  compare (payload) {
    let passwordIsValid = false

    if (payload && payload.receivedPassword && payload.hash) {
      passwordIsValid = this._bcrypt.compareSync(payload.receivedPassword, payload.hash)
    }

    return passwordIsValid
  }

  b64Encode (payload) {
    if (!payload) {
      return ''
    }

    payload = typeof payload === 'string' ? payload : JSON.stringify(payload)
    return Buffer.from(payload).toString('base64')
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }

  b64Decode (payload) {
    if (!payload) {
      return ''
    }

    payload = typeof payload === 'string' ? payload : JSON.stringify(payload)
    return Buffer.from(payload, 'base64').toString()
  }

  get crypto () {
    return {
      generatePrivateKey: this.generatePrivateKey.bind(this),
      cypherObject: this.cypherObject.bind(this),
      decipherObject: this.decipherObject.bind(this)
    }
  }

  get encoder () {
    return {
      base64: {
        encode: this.b64Encode.bind(this),
        decode: this.b64Decode.bind(this)
      }
    }
  }

  get hash () {
    return {
      stringToHash: this.stringToHash.bind(this),
      isValid: this.compare.bind(this)
    }
  }

  get token () {
    return {
      create: this.createToken.bind(this),
      destroy: this.destroyToken.bind(this),
      validate: this.validateToken.bind(this)
    }
  }

  get middleware () {
    return {
      validateApi: this.validateApi.bind(this)
    }
  }
}

module.exports = { AuthManager }
