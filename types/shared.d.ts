import { ValidationResult } from './validation-result';

export type StateCallback = (validationResult: ValidationResult) => any;
export type predicateFn = (...value: any[]) => (boolean | Promise<boolean>);
