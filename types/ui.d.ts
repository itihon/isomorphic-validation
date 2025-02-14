import { ValidationResult } from "./validation-result";
import { Validator } from "./predicate";
import { StateCallback } from "./shared";

type ValidatorEntry = [any, Validator];
type ValidityStateValues = { true: any, false: any, anyValue?: any };
type SetEffectFn = (validationResult: ValidationResult) => void;
type CancelEffectFn = () => void;
type EffectControlFns = [CancelEffectFn, SetEffectFn];
type EffectFunction = (
    element: HTMLElement, 
    stateValues: ValidityStateValues, 
    validationResult: ValidationResult
) => void;

type SetEffectByValidityFn1 = (
    htmlElement?: HTMLElement, stateValues?: ValidityStateValues
) => EffectControlFns;

type SetEffectByValidityFn2 = (
    stateValues?: ValidityStateValues, htmlElement?: HTMLElement
) => EffectControlFns;

type SetEffectByValidityFn = SetEffectByValidityFn1 
    & SetEffectByValidityFn2;

type RendererFn = (entry: [obj: object, content: string], idx: number) => string;

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
         * Creates a state callback function for rendering a message of the first "invalid" validator in the passed in validation result
         * @param msgPropName - A property name of a validator message
         * @param rendererFn - A function that renders an entry of object and content to an HTML string
         */
        declare function renderFirstError(msgPropName?: string, rendererFn?: RendererFn): StateCallback 

        /**
         * Creates a state callback function for rendering messages of all "invalid" validators in the passed in validation result
         * @param msgPropName - A property name of a validator message
         * @param rendererFn - A function that renders an entry of object and content to an HTML string
         */
        declare function renderAllErrors(msgPropName?: string, rendererFn?: RendererFn): StateCallback 
        
        /**
         * Creates a state callback function for rendering the specified property of all validators in the passed in validation result
         * @param propName - A property name of a validator
         * @param rendererFn - A function that renders an entry of object and content to an HTML string
         */
        declare function renderProperty(propName?: string, rendererFn?: RendererFn): StateCallback 

        /**
         * A function wrapper that allows to use a state callback function as an event handler
         * @param callback - A state callback function wich accepts ValidationResult as the argument
         * @param isValid - Validity value with witch the state callback function will be called
         */
        declare function toEventHandler(callback: StateCallback, isValid?: boolean): EventListener 

        /**
         * Creates a function which performs a delayed effect depending on validity.
         * @param effectFn - A function which will be called by the `set` function and cancelled by the `cancel` function.
         * @param defaultStateValues - An object with default state values, will be passed into the `effectFn` function if not overriden.
         */
        declare function createApplyEffect(
            effectFn: EffectFunction, 
            defaultStateValues: ValidityStateValues
        ): SetEffectByValidityFn;

        /**
         * Sets a class name for an element depending on valididy.
         */
        declare const applyClass: SetEffectByValidityFn;

        /**
         * Sets an outline for an element depending on valididy.
         */
        declare const applyOutline: SetEffectByValidityFn;

        /**
         * Sets a background color of an element depending on valididy.
         */
        declare const applyBackground: SetEffectByValidityFn;

        /**
         * Sets the 'disabled' attribute of an element depending on valididy.
         */
        declare const applyAccess: SetEffectByValidityFn;
        
        /**
         * Creates a box with content adjacent to an element depending on valididy.
         */
        declare const applyBox: SetEffectByValidityFn;
    }

    export = UI;
}