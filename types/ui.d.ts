import { ValidationResult } from "./validation-result";
import { Validator } from "./predicate";

type ValidatorEntry = [any, Validator];
type ValidityStateValues = { true: any, false: any, anyValue?: any };
type SetEffectFn = (validationResult: ValidationResult) => void;
type CancelEffectFn = () => void;
type EffectControlFns = [CancelEffectFn, SetEffectFn];
type EffectFunction = (
    element: HTMLElement, stateValues: ValidityStateValues, isValid: boolean
) => void;

type SetEffectByValidityFn1 = (
    htmlElement?: HTMLElement, delay?: number, stateValues?: ValidityStateValues
) => EffectControlFns;

type SetEffectByValidityFn2 = (
    delay?: number, htmlElement?: HTMLElement, stateValues?: ValidityStateValues
) => EffectControlFns;

type SetEffectByValidityFn3 = (
    delay?: number, stateValues?: ValidityStateValues, htmlElement?: HTMLElement 
) => EffectControlFns;

type SetEffectByValidityFn4 = (
    htmlElement?: HTMLElement, stateValues?: ValidityStateValues, delay?: number
) => EffectControlFns;

type SetEffectByValidityFn5 = (
    stateValues?: ValidityStateValues, htmlElement?: HTMLElement, delay?: number
) => EffectControlFns;

type SetEffectByValidityFn6 = (
    stateValues?: ValidityStateValues, delay?: number, htmlElement?: HTMLElement
) => EffectControlFns;

type SetEffectByValidityFn = SetEffectByValidityFn1 
    & SetEffectByValidityFn2
    & SetEffectByValidityFn3
    & SetEffectByValidityFn4
    & SetEffectByValidityFn5
    & SetEffectByValidityFn6;

declare module "isomorphic-validation/ui" {
    declare namespace UI {
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

        /**
         * Creates a function which performs a delayed effect depending on validity.
         * @param effectFn - A function which will be called by the `set` function and cancelled by the `cancel` function.
         * @param defaultStateValues - An object with default state values, will be passed into the `effectFn` function if not overriden.
         */
        declare function setByValidity(
            effectFn: EffectFunction, 
            defaultStateValues: ValidityStateValues
        ): SetEffectByValidityFn;

        /**
         * Sets a class name for an element depending on valididy.
         */
        declare const setClassByValidity: SetEffectByValidityFn;

        /**
         * Sets an outline for an element depending on valididy.
         */
        declare const setOutlineByValidity: SetEffectByValidityFn;
    }

    export = UI;
}