import { GROUPED } from '../constants';
import CloneRegistry from '../types/clone-registry';
import ValidatedForm from '../types/validated-form';
import clone from './clone';
import makeGroupValidationsFn from './make-group-validations-fn';

export default function createProfile(
  selector = '',
  fieldNames = [],
  validations = [],
) {
  const cloneValidation = (validation) =>
    clone({ validation, registry: CloneRegistry() });

  const bind = (form) => (validation, idx) =>
    validation.bind(form[fieldNames[idx]]);

  const validatedForm = ValidatedForm(selector, fieldNames);

  const clonedValidations = validations
    .map(cloneValidation)
    .map(bind(validatedForm));

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
    {
      form: validatedForm,
      validation: Object.create(
        makeGroupValidationsFn(GROUPED)(clonedValidations),
      ),
      [Symbol.toStringTag]: 'ValidationProfile',
    },
  );
}
