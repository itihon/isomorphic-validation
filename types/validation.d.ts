import { ValidationResult } from './validation-result';
import { Predicate } from './predicate';
import { stateCallback, predicateFn } from './shared';

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
    let constraints: Map<object, Set<Array<Predicate>>>;
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
     *  @param {stateCallback} callback
     *  @returns {Validation}
     */
    function started(callback: stateCallback): Validation;
    /**
     * Adds a state callback.
     *  @param {stateCallback} callback
     *  @returns {Validation}
     */
    function valid(callback: stateCallback): Validation;
    /**
     * Adds a state callback.
     *  @param {stateCallback} callback
     *  @returns {Validation}
     */
    function invalid(callback: stateCallback): Validation;
    /**
     * Adds a state callback.
     *  @param {stateCallback} callback
     *  @returns {Validation}
     */
    function changed(callback: stateCallback): Validation;
    /**
     * Adds a state callback.
     *  @param {stateCallback} callback
     *  @returns {Validation}
     */
    function validated(callback: stateCallback): Validation;
    /**
     * Adds an error state callback and catches an error.
     *  @param {stateCallback} callback
     *  @returns {Validation}
     */
    function error(callback: stateCallback): Validation;
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
    function constraint(predicate: predicateFn, params: {
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
     *  @param {object} params
     *  @param {Boolean} [params.next=true] - When false, the next predicate will not be executed if the current one returns false.
     *  @param {Number} [params.debounce=0] - Time in ms.
     *  @param {Boolean} [params.keepValid=false] - If true, whenever this predicate returns false, the validatable value will be replaced with the previous valid value.
     *  @param {Boolean} [params.optional=false] - If true, the predicate will only execute when the validatable vlaue is not equal to the validation's initial value or undefined.
     *  @param {any} [params.anyData] - Any additional data, will be accessible in the validation constraints collection and a validation result.
     *  @returns {Validation}
     */
    function constraint(predicate: Predicate, params: {
        next?: boolean;
        debounce?: number;
        keepValid?: boolean;
        optional?: boolean;
        anyData?: any;
    }): Validation;
    /**
     * Binds the validation to a new validatable item.
     *  @param {Object} obj - A validatable object to bind the validation to.
     *  @param {string} propName - A property name or a path to the validatable value with dots as delimitters.
     *  @param {*} initVal - An initial value of the validatable item.
     *  @returns {Validation}
     */
    function bind(obj: any, propName: string, initVal: any): Validation;
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
