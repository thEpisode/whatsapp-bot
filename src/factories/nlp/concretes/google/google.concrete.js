const BaseProduct = require("../base/base.product")

class GoogleConcrete extends BaseProduct {
  constructor (dependencies) {
    super(dependencies)
  }

  predict ({ message }) {
    const serviceResponse = super.predict({ message })

    return {
      isPredicted: false,
      prediction: null
    }
  }
}

module.exports = GoogleConcrete
