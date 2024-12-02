import { Predicate } from './predicate';
import { Validation } from './validation';
import { ValidationProfile } from './validation-profile';

type Validations = Validation | Array<Validation>;

declare namespace IsomorphicValidation {
    /**
     * Creates a validation.
     * @param {Object} obj - A validatable object to bind the validation to.
     * @param {Object} options
     * @param {string} [options.path] - A property name or a path to the validatable value with dots as delimitters.
     * @param {*} [options.initValue] - An initial value of the validatable item.
     * @param {Boolean} [options.optional=false] - If true, the predicate will only execute when the validatable vlaue is not equal to the validation's initial value or undefined.
     * @returns {Validation}
     */
    function Validation(obj: Object, options?: { 
        path?: String, 
        initValue?: any,
        optional?: Boolean,
    }): Validation;

    declare namespace Validation {
        /**
         * Groups validations into one that is subscribed to each.
         * @param {...Validations} validations - Validations or arrays of validations in any combination.
         * @returns {Validation} 
         */
        function group(...validations: Validations[]): Validation;
        /**
         * Glues validations into one that is subscribed to each.
         * @param {...Validations} validations - Validations or arrays of validations in any combination.
         * @returns {Validation} 
         */
        function glue(...validations: Validations[]): Validation;
        /**
         * Clones a validation with its constraints, state callbacks and nested validations.
         * @param {Validation} validation - Validations or arrays of validations in any combination.
         * @returns {Validation} 
         */
        function clone(validation: Validation): Validation;
        /**
         * Creates a validation profile. 
         * @param {String} selector - A selector of HTML \<form\> element.
         * @param {Array<String>} fieldNames - An array of the form's field names.
         * @param {Array<Validation>} validations - An array of validations to be bound to each form field and grouped into one.
         * @returns {ValidationProfile}
         */
        function profile(selector: String, fieldNames: String[], validations: Validation[]): ValidationProfile;
    }

    /**
     * Creates a predicate object.
     * @overload
     * @param {predicateFn} predicateFn - A predicate function to be wrapped.
     * @returns {Predicate}
     */
    declare function Predicate(predicateFn: () => Boolean): Predicate

    /**
     * Creates a predicate object.
     * @overload
     * @param {Predicate} predicate - A predicate object to be cloned.
     * @returns {Predicate}
     */
    declare function Predicate(predicate: Predicate): Predicate
}

export = IsomorphicValidation;