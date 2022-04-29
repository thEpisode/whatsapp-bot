/**
 * @typedef {Object} InputTypeArgs
 * @property {object} action Current conversation action action.
 * @property {object} message - Is the incoming message.
 */
/**
 * @typedef {Object} InputTypeResult
 * @property {object} action Current conversation action action.
 * @property {object} message - Is the incoming message.
 */

class InputTypeValidator {
  constructor () { /* Default constructor */ }

  invalidInput ({ messages }) {
    return {
      intent: {
        id: 'no-key',
        messages: [
          {
            'body': 'I can\'t process this message, please validate your information'
          },
          ...messages
        ],
        services: {
          preflight: null,
          callback: null
        }
      },
      isValid: false
    }
  }

  /**
   * Validate if input type of current action is valid
   */
  validate ({ action, message }) {
    let input = {
      isValid: false,
      intent: {}
    }

    switch (action.inputType) {
      case 'regex':
        input = this.validateInputTypeRegex({ action, message })
        break
      case 'option-string':
        input = this.validateInputTypeOptionString({ action, message })
        break
      case 'option-number':
        input = this.validateInputTypeOptionNumber({ action, message })
        break
      case 'any':
        input = this.validateInputTypeAny({ action, message })
        break
      case 'any-number':
        input = this.validateInputTypeAnyNumber({ action, message })
        break
    }

    return input
  }

  /**
   * Validate the type "Option Number" and return current error messages
   * @param {InputTypeArgs} args - Arguments to validate given input type.
   * @returns {InputTypeResult} result - Is the result of given input type.
   */
  validateInputTypeOptionNumber ({ action, message }) {
    let intent = {}
    let isValid = false

    if (!action.intents || !action.intents.length) {
      return this.invalidInput({
        messages: [
          {
            body: 'Error: Input not match with valid options'
          }
        ]
      })
    }

    if (!message || !message.body) {
      return this.invalidInput({
        messages: [
          {
            body: 'Error: Input has not a valid body'
          }
        ]
      })
    }

    // Iterate over every valid options
    intent = action.intents.find(option => {
      // Transforming option to string to prevent type misuse
      option.key += ''

      // Validation if message is exactly of option
      if (message.body.toLocaleLowerCase().trim() === option.key.toLocaleLowerCase().trim()) {
        isValid = true
        return true
      }
    })

    return {
      intent,
      isValid
    }
  }

  /**
   * Validate the type "Option String" and return current error messages
   * @param {InputTypeArgs} args - Arguments to validate given input type.
   * @returns {InputTypeResult} result - Is the result of given input type.
   */
  validateInputTypeOptionString ({ action, message }) {
    let intent = {}
    let isValid = false

    if (!action.intents || !action.intents.length) {
      return this.invalidInput({
        messages: [
          {
            body: 'Error: Input not match with valid options'
          }
        ]
      })
    }

    if (!message || !message.body) {
      return this.invalidInput({
        messages: [
          {
            body: 'Error: Input has not a valid body'
          }
        ]
      })
    }

    // Iterate over every valid options
    intent = action.intents.find(option => {
      // Regex for whole word in options, NOT CONTAINS
      const regex = new RegExp('\\b(' + option.key.toLocaleLowerCase().trim() + ')\\b', 'g')
      if (message.body.toLocaleLowerCase().trim().match(regex)) {
        isValid = true
        return true
      }
    })

    return {
      intent,
      isValid
    }
  }

  /**
   * Validate the type "Any" and return current error messages
   * @param {InputTypeArgs} args - Arguments to validate given input type.
   * @returns {InputTypeResult} result - Is the result of given input type.
   */
  validateInputTypeAny ({ action, message }) {
    let isValid = false

    if (!message || !message.body) {
      return this.invalidInput({
        messages: [
          {
            body: 'Error: Input has not a valid body'
          }
        ]
      })
    }

    if (!action.intents || !action.intents.length) {
      return this.invalidInput({
        messages: [
          {
            body: 'Error: Input not match with valid options'
          }
        ]
      })
    }

    isValid = true

    return {
      intent: action.intents[0],
      isValid
    }
  }

  /**
   * Validate the type "Any Number" and return current error messages
   * @param {InputTypeArgs} args - Arguments to validate given input type.
   * @returns {InputTypeResult} Action of given input type.
   */
  validateInputTypeAnyNumber ({ action, message }) {
    let intent = {}
    let isValid = false

    if (!message || !message.body) {
      return this.invalidInput({
        messages: [
          {
            body: 'Error: Input has not a valid body'
          }
        ]
      })
    }

    if (!action.intents || !action.intents.length) {
      return this.invalidInput({
        messages: [
          {
            body: 'Error: Input not match with valid options'
          }
        ]
      })
    }

    if (isNaN(message.body.toLocaleLowerCase().trim())) {
      return this.invalidInput({
        messages: [
          {
            body: 'Error: Input is not a number'
          }
        ]
      })
    }

    isValid = true

    return {
      intent,
      isValid
    }
  }

  /**
   * Validate the type "Any Number" and return current error messages
   * @param {InputTypeArgs} args - Arguments to validate given input type.
   * @returns {InputTypeResult} Action of given input type.
   */
  validateInputTypeRegex ({ action, message }) {
    let intent = {}
    let isValid = false

    if (!message || !message.body) {
      return this.invalidInput({
        messages: [
          {
            body: 'Error: Input has not a valid body'
          }
        ]
      })
    }

    if (!action.intents || !action.intents.length) {
      return this.invalidInput({
        messages: [
          {
            body: 'Error: Input not match with valid options'
          }
        ]
      })
    }

    // TODO: Improve match
    const regex = new RegExp(action.intents.toLocaleLowerCase().trim(), 'g')
    if (message.body.toLocaleLowerCase().trim().match(regex, 'g')) {
      isValid = true
      intent = { isMatched: true }
    } else {
      intent = { isMatched: false }
    }

    return {
      intent,
      isValid
    }
  }
}

module.exports = InputTypeValidator