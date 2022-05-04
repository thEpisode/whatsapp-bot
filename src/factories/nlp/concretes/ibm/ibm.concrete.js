const BaseProduct = require("../base/base.product")

class IbmConcrete extends BaseProduct {
  constructor (dependencies) {
    super(dependencies)
  }

  predict ({ message }) {
    const serviceResponse = super.predict({ message })

    this._console.info('IBM NLP service response:')
    console.log(serviceResponse)

    return {
      isPredicted: false,
      prediction: null
    }
  }
}

module.exports = IbmConcrete
