import { stateCallback } from './shared';

export type Predicate = typeof PredicateAPI;
export type Validator = { 
    /**
     * Current validity state of the validator.
     */
    isValid: boolean 
} & Predicate;

declare namespace PredicateAPI {
    /**
     * Adds a state callback.
     *  @param {stateCallback} callback
     *  @returns {Predicate}
     */
    function started(callback: stateCallback): Predicate;
    /**
     * Adds a state callback.
     *  @param {stateCallback} callback
     *  @returns {Predicate}
     */
    function valid(callback: stateCallback): Predicate;
    /**
     * Adds a state callback.
     *  @param {stateCallback} callback
     *  @returns {Predicate}
     */
    function invalid(callback: stateCallback): Predicate;
    /**
     * Adds a state callback.
     *  @param {stateCallback} callback
     *  @returns {Predicate}
     */
    function changed(callback: stateCallback): Predicate;
    /**
     * Adds a state callback.
     *  @param {stateCallback} callback
     *  @returns {Predicate}
     */
    function validated(callback: stateCallback): Predicate;
    /**
     * Adds a state callback.
     *  @param {stateCallback} callback
     *  @returns {Predicate}
     */
    function restored(callback: stateCallback): Predicate;
    /**
     * Adds an error state callback and catches an error.
     *  @param {stateCallback} callback
     *  @returns {Predicate}
     */
    function error(callback: stateCallback): Predicate;
    /**
     * Refers to the api object on the server side and a dummy object on the client side.
     */
    let server: Predicate;
    /**
     * Refers to the api object on the client side and a dummy object on the server side.
     */
    let client: Predicate;
    /**
     * Refers to the api object regardles of the execution environment.
     */
    let isomorphic: Predicate;
}
