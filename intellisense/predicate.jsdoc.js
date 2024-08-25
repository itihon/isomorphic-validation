/**
 * @typedef {import('./shared.jsdoc.js').stateCallback} stateCallback
 */

export default class Predicate {
    /**
     * Adds a state callback.
     *  @param {stateCallback} callback 
     *  @returns {Predicate}
     */
    started   (callback) {}

    /**
     * Adds a state callback.
     *  @param {stateCallback} callback 
     *  @returns {Predicate}
     */
    valid     (callback) {}

    /**
     * Adds a state callback.
     *  @param {stateCallback} callback 
     *  @returns {Predicate}
     */
    invalid   (callback) {}

    /**
     * Adds a state callback.
     *  @param {stateCallback} callback 
     *  @returns {Predicate}
     */
    changed   (callback) {}

    /**
     * Adds a state callback.
     *  @param {stateCallback} callback 
     *  @returns {Predicate}
     */
    validated (callback) {}
    
    /**
     * Adds a state callback.
     *  @param {stateCallback} callback 
     *  @returns {Predicate}
     */
    restored (callback) {}
    
    
    /**
     * Refers to the api object on the server side and a dummy object on the client side.
     *  @type {Predicate}
     */
    server

    /**
     * Refers to the api object on the client side and a dummy object on the server side.
     *  @type {Predicate}
     */
    client

    /**
     * Refers to the api object regardles of the execution environment.
     *  @type {Predicate}
     */
    isomorphic
}