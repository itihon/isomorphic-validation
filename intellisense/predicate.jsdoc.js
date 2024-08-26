export {}

/**
 * @typedef {import('./shared.jsdoc.js').stateCallback} stateCallback
 * @typedef {typeof PredicateAPI} Predicate
 */

const PredicateAPI = {};

/**
 * Adds a state callback.
 *  @param {stateCallback} callback 
 *  @returns {Predicate}
 */
PredicateAPI.started = function (callback) {};

/**
 * Adds a state callback.
 *  @param {stateCallback} callback 
 *  @returns {Predicate}
 */
PredicateAPI.valid = function (callback) {};

/**
 * Adds a state callback.
 *  @param {stateCallback} callback 
 *  @returns {Predicate}
 */
PredicateAPI.invalid = function (callback) {};

/**
 * Adds a state callback.
 *  @param {stateCallback} callback 
 *  @returns {Predicate}
 */
PredicateAPI.changed = function (callback) {};

/**
 * Adds a state callback.
 *  @param {stateCallback} callback 
 *  @returns {Predicate}
 */
PredicateAPI.validated = function (callback) {};
    
/**
 * Adds a state callback.
 *  @param {stateCallback} callback 
 *  @returns {Predicate}
 */
PredicateAPI.restored = function (callback) {};
    
    
/**
 * Refers to the api object on the server side and a dummy object on the client side.
 *  @type {Predicate}
 */
PredicateAPI.server;

/**
 * Refers to the api object on the client side and a dummy object on the server side.
 *  @type {Predicate}
 */
PredicateAPI.client;

/**
 * Refers to the api object regardles of the execution environment.
 *  @type {Predicate}
 */
PredicateAPI.isomorphic;