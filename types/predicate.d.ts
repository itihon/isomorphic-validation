import { StateCallback } from './shared';

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
     *  @param {StateCallback} callback
     *  @returns {Predicate}
     */
    function started(callback: StateCallback): Predicate;
    /**
     * Adds a state callback.
     *  @param {StateCallback} callback
     *  @returns {Predicate}
     */
    function valid(callback: StateCallback): Predicate;
    /**
     * Adds a state callback.
     *  @param {StateCallback} callback
     *  @returns {Predicate}
     */
    function invalid(callback: StateCallback): Predicate;
    /**
     * Adds a state callback.
     *  @param {StateCallback} callback
     *  @returns {Predicate}
     */
    function changed(callback: StateCallback): Predicate;
    /**
     * Adds a state callback.
     *  @param {StateCallback} callback
     *  @returns {Predicate}
     */
    function validated(callback: StateCallback): Predicate;
    /**
     * Adds a state callback.
     *  @param {StateCallback} callback
     *  @returns {Predicate}
     */
    function restored(callback: StateCallback): Predicate;
    /**
     * Adds an error state callback and catches an error.
     *  @param {StateCallback} callback
     *  @returns {Predicate}
     */
    function error(callback: StateCallback): Predicate;
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
