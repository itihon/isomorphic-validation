import { ValidationResult } from "./validation-result";

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