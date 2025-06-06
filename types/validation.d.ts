import { ValidationResult } from './validation-result';
import { Predicate, Validator } from './predicate';
import { StateCallback, PredicateFn } from './shared';

export type Validation = typeof ValidationAPI;
export type mapperFn = (req: object, form: object) => any;

/**
 * A validation middleware on the server side.
 * @overload
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
declare function ValidationAPI(req: any, res: any, next: any): any;
/**
 * A validation event handler on the client side.
 * @overload
 * @param {Event} event
 */
declare function ValidationAPI(event: Event): any;

declare namespace ValidationAPI {
    /** 
     * The current state of the validation.
     */
    let isValid: boolean;
    /**
     * A map with validatable objects as keys and sets of constraints as values.
     */
    let constraints: Map<any, Validator>;
    /**
     * An array of grouped (nested) validations.
     */
    let validations: Array<Validation>;
    /**
     * Refers to the api object on the server side and a dummy object on the client side.
     */
    let server: Validation;
    /**
     * Refers to the api object on the client side and a dummy object on the server side.
     */
    let client: Validation;
    /**
     * Refers to the api object regardles of the execution environment.
     */
    let isomorphic: Validation;
    /**
     * Adds a state callback.
     *  @param {StateCallback} callback
     *  @returns {Validation}
     */
    function started(callback: StateCallback): Validation;
    /**
     * Adds a state callback.
     *  @param {StateCallback} callback
     *  @returns {Validation}
     */
    function valid(callback: StateCallback): Validation;
    /**
     * Adds a state callback.
     *  @param {StateCallback} callback
     *  @returns {Validation}
     */
    function invalid(callback: StateCallback): Validation;
    /**
     * Adds a state callback.
     *  @param {StateCallback} callback
     *  @returns {Validation}
     */
    function changed(callback: StateCallback): Validation;
    /**
     * Adds a state callback.
     *  @param {StateCallback} callback
     *  @returns {Validation}
     */
    function validated(callback: StateCallback): Validation;
    /**
     * Adds an error state callback and catches an error.
     *  @param {StateCallback} callback
     *  @returns {Validation}
     */
    function error(callback: StateCallback): Validation;
    /**
     * Adds a constraint to the validation.
     *  @overload
     *  @param {PredicateFn} predicate - A predicate function.
     *  @param {object} options
     *  @param {Boolean} [options.next=true] - When false, the next predicate will not be executed if the current one returns false.
     *  @param {Number} [options.debounce=0] - Time in ms.
     *  @param {Boolean} [options.keepValid=false] - If true, whenever this predicate returns false, the validatable value will be replaced with the previous valid value.
     *  @param {Boolean} [options.optional=false] - If true, the predicate will only execute when the validatable vlaue is not equal to the validation's initial value or undefined.
     *  @param {any} [options.anyData] - Any additional data, will be accessible in the validation constraints collection and a validation result.
     *  @returns {Validation}
     */
    function constraint(predicate: PredicateFn, options?: {
        next?: boolean;
        debounce?: number;
        keepValid?: boolean;
        optional?: boolean;
        anyData?: any;
    }): Validation;
    /**
     * Adds a constraint to the validation.
     *  @overload
     *  @param {Predicate} predicate - A predicate function wrapped in a Predicate object.
     *  @param {object} options
     *  @param {Boolean} [options.next=true] - When false, the next predicate will not be executed if the current one returns false.
     *  @param {Number} [options.debounce=0] - Time in ms.
     *  @param {Boolean} [options.keepValid=false] - If true, whenever this predicate returns false, the validatable value will be replaced with the previous valid value.
     *  @param {Boolean} [options.optional=false] - If true, the predicate will only execute when the validatable vlaue is not equal to the validation's initial value or undefined.
     *  @param {any} [options.anyData] - Any additional data, will be accessible in the validation constraints collection and a validation result.
     *  @returns {Validation}
     */
    function constraint(predicate: Predicate, options?: {
        next?: boolean;
        debounce?: number;
        keepValid?: boolean;
        optional?: boolean;
        anyData?: any;
    }): Validation;
    /**
     * Binds the validation to a new validatable object.
     *  @param {object} obj - A validatable object to bind the validation to.
     *  @param {object} options
     *  @param {string} [options.path] - A property name or a path to the validatable value with dots as delimitters.
     *  @param {*} [options.initValue] - An initial value of the validatable item.
     *  @returns {Validation}
     */
    function bind(obj: any, options?: { 
        path?: string, 
        initValue?: any 
    }): Validation;
    /**
     * Sets a data mapper function. Used only on the server side.
     *  @param {mapperFn} mapperFn
     *  @returns {Validation}
     */
    function dataMapper(mapperFn: mapperFn): Validation;
    /**
     * Executes either all predicate groups or only the groups associated with the passed validatable object.
     *  @param {object} [validatableObject]
     *  @returns {Promise<ValidationResult>}
     */
    function validate(validatableObject?: object): Promise<ValidationResult>;
}
