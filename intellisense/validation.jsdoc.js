export {}

/**
 * @typedef {import('./validation-result.jsdoc.js').ValidationResult} ValidationResult
 * @typedef {import('./predicate.jsdoc.js').Predicate} Predicate
 * @typedef {import('./shared.jsdoc.js').stateCallback} stateCallback
 * @typedef {import('./shared.jsdoc.js').predicateFn} predicateFn
 * @typedef {typeof ValidationAPI} Validation
 */

/**
 * @callback mapperFn
 *  @param {object} req
 *  @param {object} form
 */

/**
 * A validation middleware on the server side.
 * @overload 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

/**
 * A validation event handler on the client side.
 * @overload
 * @param {Event} event
 */

function ValidationAPI() {};

/** 
 * The current state of the validation.
 *  @type {Boolean} 
 */
ValidationAPI.isValid;

/**
 * A map with validatable objects as keys and sets of constraints as values.
 *  @type {Map.<object, Set>} 
 */
ValidationAPI.constraints;

/**
 * An array of grouped (nested) validations.
 *  @type {Array.<Validation>}
 */
ValidationAPI.validations;

/**
 * Refers to the api object on the server side and a dummy object on the client side.
 *  @type {Validation}
 */
ValidationAPI.server;

/**
 * Refers to the api object on the client side and a dummy object on the server side.
 *  @type {Validation}
 */
ValidationAPI.client;

/**
 * Refers to the api object regardles of the execution environment.
 *  @type {Validation}
 */
ValidationAPI.isomorphic;

/**
 * Adds a state callback.
 *  @param {stateCallback} callback 
 *  @returns {Validation}
 */
ValidationAPI.started = function (callback) {};

/**
 * Adds a state callback.
 *  @param {stateCallback} callback 
 *  @returns {Validation}
 */
ValidationAPI.valid = function (callback) {};

/**
 * Adds a state callback.
 *  @param {stateCallback} callback 
 *  @returns {Validation}
 */
ValidationAPI.invalid = function (callback) {};

/**
 * Adds a state callback.
 *  @param {stateCallback} callback 
 *  @returns {Validation}
 */
ValidationAPI.changed = function (callback) {};

/**
 * Adds a state callback.
 *  @param {stateCallback} callback 
 *  @returns {Validation}
 */
ValidationAPI.validated = function (callback) {};


/**
 * Adds a constraint to the validation.
 *  @overload
 *  @param {predicateFn} predicate - A predicate function.
 *  @param {object} params
 *  @param {Boolean} [params.next=true] - When false, the next predicate will not be executed if the current one returns false.
 *  @param {Number} [params.debounce=0] - Time in ms.
 *  @param {Boolean} [params.keepValid=false] - If true, whenever this predicate returns false, the validatable value will be replaced with the previous valid value.
 *  @param {Boolean} [params.optional=false] - If true, the predicate will only execute when the validatable vlaue is not equal to the validation's initial value or undefined.
 *  @param {any} [params.anyData] - Any additional data, will be accessible in the validation constraints collection and a validation result.
 *  @returns {Validation}
 */ 

/**
 * Adds a constraint to the validation.
 *  @overload
 *  @param {Predicate} predicate - A predicate function wrapped in a Predicate object.
 *  @param {object} params
 *  @param {Boolean} [params.next=true] - When false, the next predicate will not be executed if the current one returns false.
 *  @param {Number} [params.debounce=0] - Time in ms.
 *  @param {Boolean} [params.keepValid=false] - If true, whenever this predicate returns false, the validatable value will be replaced with the previous valid value.
 *  @param {Boolean} [params.optional=false] - If true, the predicate will only execute when the validatable vlaue is not equal to the validation's initial value or undefined.
 *  @param {any} [params.anyData] - Any additional data, will be accessible in the validation constraints collection and a validation result.
 *  @returns {Validation}
 */ 
ValidationAPI.constraint = function (predicate, { next, debounce, keepValid, optional, ...anyData }) {};

/**
 * Binds the validation to a new validatable item.
 *  @param {Object} obj - A validatable object to bind the validation to.
 *  @param {string} propName - A property name or a path to the validatable value with dots as delimitters.
 *  @param {*} initVal - An initial value of the validatable item.
 *  @returns {Validation}
 */
ValidationAPI.bind = function (obj, propName, initVal) {};

/**
 * Sets a data mapper function. Used only on the server side. 
 *  @param {mapperFn} mapperFn
 *  @returns {Validation}
 */
ValidationAPI.dataMapper = function (mapperFn) {};

/**
 * Executes either all predicate groups or only the groups associated with the passed validatable object.
 *  @param {object} [validatableObject]
 *  @returns {Promise<ValidationResult>}
 */
ValidationAPI.validate = function (validatableObject) {};


