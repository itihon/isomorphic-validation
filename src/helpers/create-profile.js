import { GROUPED } from '../constants';
import CloneRegistry from '../types/clone-registry';
import ValidatableForm from '../types/validatable-form';
import clone from './clone';
import makeGroupValidationsFn from './make-group-validations-fn';
import makeValidationHandlerFn from './make-validation-handler-fn';

const cloneValidation = (validation) =>
  clone({ validation, registry: CloneRegistry() });

const bind = (form, fieldNames) => (validation, idx) =>
  validation.bind(form[fieldNames[idx]]);

const getItems = (validation) => validation.valueOf().items;
const getPath = (validatableItem) => validatableItem.getPath();
const firstEntrie = (items) => items.entries().next().value;
const firstItemFromEntrie = ([, set]) => [...set][0];

const assignValidations = (validations) => (profile, fieldName, idx) => {
  const validation = validations[idx];

  if (validation) {
    Object.defineProperty(profile.validation, fieldName, {
      value: validation,
      enumerable: true,
    });
  }

  return profile;
};

const profile = (form, validation) =>
  Object.defineProperties(makeValidationHandlerFn(validation, form), {
    form: { value: form },
    validation: { value: validation },
    [Symbol.toStringTag]: { value: 'ValidationProfile' },
  });

export default function createProfile(
  selector = '',
  fieldNames = [],
  validations = [],
) {
  const paths = validations
    .map(getItems)
    .map(firstEntrie)
    .map(firstItemFromEntrie)
    .map(getPath);

  const validatableForm = ValidatableForm(selector, fieldNames, paths);

  const clonedValidations = validations
    .map(cloneValidation)
    .map(bind(validatableForm, fieldNames));

  const groupedValidations = Object.create(
    makeGroupValidationsFn(GROUPED)(clonedValidations),
  );

  return fieldNames.reduce(
    assignValidations(clonedValidations),
    profile(validatableForm, groupedValidations),
  );
}
