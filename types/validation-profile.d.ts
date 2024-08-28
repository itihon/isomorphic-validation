import { Validation } from './validation';

export interface ValidationProfile extends Iterable<HTMLFormElement | Validation> {
    form: HTMLFormElement;
    validation: Validation;
    [0]: HTMLFormElement;
    [1]: Validation;
}
