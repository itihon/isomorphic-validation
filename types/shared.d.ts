import { ValidationResult } from './validation-result';

export type stateCallback = (validationResult: ValidationResult) => any;
export type predicateFn = (...value: any[]) => (boolean | Promise<boolean>);
