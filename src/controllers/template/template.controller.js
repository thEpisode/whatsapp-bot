class TemplateController {
  constructor (dependencies) {
    /* Base Properties */
    this._dependencies = dependencies
    this._db = dependencies.db
    this._models = dependencies.models
    this._utilities = dependencies.utilities
    this._console = this._dependencies.console
    this._firebase = dependencies.firebaseManager
    this._controllers = this._dependencies.controllers

    /* Custom Properties */
    /* this._myPrivateProperty = 'Some value' */

    /* Assigments */
    /* this._newPrivateObject = new SomeObject(this._dependencies) */
  }

  async get () {
    try {
      // Get values from reference as snapshot
      const docRef = this._db.collection('TABLE')
      const docRaw = await docRef.get()
      // Cast Firebase object into an arry of TABLE
      const entityResponse = this._firebase.cast.array(docRaw)
      const entityCleaned = this._utilities.response.clean(entityResponse)

      return this._utilities.response.success(entityCleaned)
    } catch (error) {
      this._console.error(error)
      return this._utilities.response.error()
    }
  }

  async getById (data) {
    try {
      if (!data || !data.id) {
        return this._utilities.response.error('Please provide an id')
      }

      // Get values from reference as snapshot
      const docRef = this._db.collection('TABLE').doc(`${data.id}`)
      const docRaw = await docRef.get()
      // Cast Firebase object into an arry of TABLE
      const entityResponse = this._firebase.cast.object(docRaw)

      // Check if exist any data
      if (!docRaw || !docRaw.exists || !entityResponse) {
        return this._utilities.response.error('No TABLE found')
      }

      return this._utilities.response.success(this._utilities.response.clean(entityResponse))
    } catch (error) {
      this._console.error(error)
      return this._utilities.response.error()
    }
  }

  async getByPROPERTY (data) {
    try {
      if (!data || !data.deviceId) {
        return this._utilities.response.error('Please provide a PROPERTY')
      }

      // Get values from reference as snapshot
      const docRef = this._db.collection('TABLE')
        .where('PROPERTY', '==', `${data.PROPERTY}`)
      const docRaw = await docRef.get()
      // Cast Firebase object into an arry of devices
      const entityResponse = this._firebase.cast.array(docRaw)

      return this._utilities.response.success(entityResponse.data)
    } catch (error) {
      this._console.error(error)
      return this._utilities.response.error()
    }
  }

  async create (data) {
    try {
      if (!data || !data.PROPERTY) {
        return this._utilities.response.error('Please provide minimum data')
      }

      const entityResponse = await this.getByPROPERTY(data)
      if (this._utilities.response.isValid(entityResponse)) {
        return this._utilities.response.error('Provided device is already registered')
      }

      data.id = this._utilities.idGenerator(15, 'PROPERTY-')
      const docRef = this._db.collection('TABLE').doc(data.id)

      const entity = new this._models.Template(data, this._dependencies)
      const docResponse = await docRef.set(entity.get)

      if (!docResponse) {
        this._console.error(docResponse)
        return this._utilities.response.error()
      }

      return this._utilities.response.success(entity.sanitized)
    } catch (error) {
      this._console.error(error)
      return this._utilities.response.error()
    }
  }

  async update (data) {
    try {
      if (!data || !data.PROPERTY) {
        return this._utilities.response.error('Please provide an PROPERTY')
      }
      const entityResponse = await this.getByPROPERTY(data)

      if (!this._utilities.response.isValid(entityResponse)) {
        return entityResponse
      }

      const docRef = this._db.collection('TABLE').doc(entityResponse.result.id)
      const entity = new this._models.Template({ ...entityResponse.result, ...data }, this._dependencies)
      const docResponse = await docRef.update(entity.get)

      if (!docResponse) {
        this._console.error(docResponse)
        return this._utilities.response.error()
      }

      return this._utilities.response.success(data)
    } catch (error) {
      this._console.error(error)
      return this._utilities.response.error()
    }
  }

  get status () {
    return this._models.Template.statuses
  }
}

module.exports = TemplateController
