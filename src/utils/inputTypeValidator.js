/**
 * @typedef {Object} InputTypeArgs
 * @property {object} intentAction Current conversation intent action.
 * @property {object} message - Is the incoming message.
 */
/**
 * @typedef {Object} InputTypeResult
 * @property {object} intentAction Current conversation intent action.
 * @property {object} message - Is the incoming message.
 */

class InputTypeValidator {
  invalidInput ({ messages }) {
    return {
      payload: {
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
  validate ({ intentAction, message }) {
    let input = {
      isValid: false,
      payload: {}
    }

    switch (intentAction.inputType) {
      case 'regex':
        input = this.validateInputTypeRegex({ intentAction, message })
        break
      case 'option-string':
        input = this.validateInputTypeOptionString({ intentAction, message })
        break
      case 'any':
        input = this.validateInputTypeAny({ intentAction, message })
        break
      case 'any-number':
        input = this.validateInputTypeAnyNumber({ intentAction, message })
        break
    }

    return input
  }

  /**
   * Validate the type "Option String" and return current error messages
   * @param {InputTypeArgs} args - Arguments to validate given input type.
   * @returns {InputTypeResult} result - Is the result of given input type.
   */
  validateInputTypeOptionString ({ intentAction, message }) {
    let payload = {}
    let isValid = false

    if (!intentAction.validOptions || !intentAction.validOptions.length) {
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
    payload = intentAction.validOptions.find(option => {
      // Regex for whole word in options, NOT CONTAINS
      const regex = new RegExp('\\b(' + option.key.toLocaleLowerCase().trim() + ')\\b', 'g')
      if (message.body.toLocaleLowerCase().trim().match(regex)) {
        isValid = true
        return true
      }
    })

    return {
      payload,
      isValid
    }
  }

  /**
   * Validate the type "Any" and return current error messages
   * @param {InputTypeArgs} args - Arguments to validate given input type.
   * @returns {InputTypeResult} result - Is the result of given input type.
   */
  validateInputTypeAny ({ intentAction, message }) {
    let payload = {}
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

    if (!intentAction.validOptions || !intentAction.validOptions.length) {
      return this.invalidInput({
        messages: [
          {
            body: 'Error: Input not match with valid options'
          }
        ]
      })
    }

    return {
      payload,
      isValid
    }
  }

  /**
   * Validate the type "Any Number" and return current error messages
   * @param {InputTypeArgs} args - Arguments to validate given input type.
   * @returns {InputTypeResult} Action of given input type.
   */
  validateInputTypeAnyNumber ({ intentAction, message }) {
    let payload = {}
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

    if (!intentAction.validOptions || !intentAction.validOptions.length) {
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
      payload,
      isValid
    }
  }

  /**
   * Validate the type "Any Number" and return current error messages
   * @param {InputTypeArgs} args - Arguments to validate given input type.
   * @returns {InputTypeResult} Action of given input type.
   */
  validateInputTypeRegex ({ intentAction, message }) {
    let payload = {}
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

    if (!intentAction.validOptions || !intentAction.validOptions.length) {
      return this.invalidInput({
        messages: [
          {
            body: 'Error: Input not match with valid options'
          }
        ]
      })
    }

    // TODO: Improve match
    const regex = new RegExp(intentAction.validOptions.toLocaleLowerCase().trim(), 'g')
    if (message.body.toLocaleLowerCase().trim().match(regex, 'g')) {
      isValid = true
      payload = { isMatched: true }
    } else {
      payload = { isMatched: false }
    }

    return {
      payload,
      isValid
    }
  }
}

module.exports = InputTypeValidator