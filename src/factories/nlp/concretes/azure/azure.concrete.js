const BaseProduct = require("../base/base.product")

class AzureConcrete extends BaseProduct {
  constructor (dependencies) {
    super(dependencies)
  }

  async predict ({ message }) {
    const response = {
      isPredicted: false,
      prediction: null
    }
    let prediction = null
    let intent = null
    const serviceResponse = await super.predict({ message })

    this._console.info('Azure NLP service response:')
    console.log(serviceResponse)

    // Validate if service response succesfully
    if (!serviceResponse || !serviceResponse.status === 200 || !serviceResponse.data || !serviceResponse.data.prediction) {
      return response
    }

    prediction = serviceResponse.data.prediction
    intent = prediction.intents[prediction.topIntent]

    // Validate if has topIntent and Intents
    if (!prediction.topIntent || !prediction.intents || !prediction.intents[prediction.topIntent]) {
      return response
    }

    // Validate if NLP is sufficient to minimum threshold
    if (+intent.score < +this._nlpEngineApp.threshold) {
      return response
    }

    return {
      isPredicted: true,
      prediction: prediction.topIntent
    }
  }
}

module.exports = AzureConcrete
