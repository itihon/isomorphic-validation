import { ValidationResult } from './validation-result';

export type StateCallback = (validationResult: ValidationResult) => any;
export type PredicateFn = (...value: any[]) => (boolean | Promise<boolean>);
