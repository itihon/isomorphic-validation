import { GROUPED } from '../constants';
import CloneRegistry from '../types/clone-registry';
import ValidatableForm from '../types/validatable-form';
import clone from './clone';
import makeGroupValidationsFn from './make-group-validations-fn';
import makeValidationHandlerFn from './make-validation-handler-fn';

export default function createProfile(
  selector = '',
  fieldNames = [],
  validations = [],
) {
  const cloneValidation = (validation) =>
    clone({ validation, registry: CloneRegistry() });

  const bind = (form) => (validation, idx) =>
    validation.bind(form[fieldNames[idx]]);

  const validatableForm = ValidatableForm(selector, fieldNames);

  const clonedValidations = validations
    .map(cloneValidation)
    .map(bind(validatableForm));

  const allValidations = Object.create(
    makeGroupValidationsFn(GROUPED)(clonedValidations),
  );

  return fieldNames.reduce(
    (profile, fieldName, idx) => {
      const validation = clonedValidations[idx];

      if (validation) {
        Object.defineProperty(profile.validation, fieldName, {
          value: validation,
          enumerable: true,
        });
      }

      return profile;
    },
    Object.defineProperties(
      makeValidationHandlerFn(allValidations, validatableForm),
      {
        form: { value: validatableForm },
        validation: { value: allValidations },
        [Symbol.toStringTag]: { value: 'ValidationProfile' },
      },
    ),
  );
}
