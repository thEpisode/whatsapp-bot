const BaseProduct = require("../base/base.product")

class AwsConcrete extends BaseProduct {
  constructor (dependencies) {
    super(dependencies)
  }

  predict ({ message }) {
    const serviceResponse = super.predict({ message })

    this._console.info('AWS NLP service response:')
    console.log(serviceResponse)

    return {
      isPredicted: false,
      prediction: null
    }
  }
}

module.exports = AwsConcrete
