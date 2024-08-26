export {}

/**
 * @typedef {import('./validation-result.jsdoc.js').ValidationResult} ValidationResult
 */

/**
 * @callback stateCallback
 *  @param {ValidationResult} validationResult
 */

/**
 * @callback predicateFn
 *  @param {...any} value
 *  @returns {(Boolean|Promise<Boolean>)}
 */
