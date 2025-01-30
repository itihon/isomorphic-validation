import { ValidationResult } from "./validation-result";
import { Predicate } from "./predicate";

type ValidatorEntry = [any, Predicate];

declare module "isomorphic-validation/helpers" {
    declare namespace Helpers {
        /**
         * Returns the first entry of "invalid" validator and validatable object
         * @param {ValidationRsult} validationResult - A validation result passed into a [state callback](https://itihon.github.io/isomorphic-validation/concept/state-callbacks/) or returned from [Validation().validate()](https://itihon.github.io/isomorphic-validation/api/validation/instance-methods/validate/) method
         * @returns {ValidatorEntry}
         */
        declare function firstInvalid(validationResult: ValidationResult): ValidatorEntry 
        /**
         * Returns all entries of "invalid" validators and validatable objects
         * @param {ValidationRsult} validationResult - A validation result passed into a [state callback](https://itihon.github.io/isomorphic-validation/concept/state-callbacks/) or returned from [Validation().validate()](https://itihon.github.io/isomorphic-validation/api/validation/instance-methods/validate/) method
         * @returns {Array<ValidatorEntry>}
         */
        declare function allInvalid(validationResult: ValidationResult): Array<ValidatorEntry> 
    }

    export = Helpers;
}