import { GROUPED } from '../constants';
import CloneRegistry from '../types/clone-registry';
import ValidatableForm from '../types/validatable-form';
import clone from './clone';
import makeGroupValidationsFn from './make-group-validations-fn';
import makeValidationHandlerFn from './make-validation-handler-fn';
import firstEntry from '../utils/firstEntry.js';

const cloneValidation = (validation) =>
  clone({ validation, registry: CloneRegistry() });

const bind = (form, fieldNames) => (validation, idx) =>
  validation.bind(form.elements[fieldNames[idx]]);

const getItems = (validation) => validation.valueOf().items;
const getPath = (validatableItem) => validatableItem.getPath();
const firstItemFromEntrie = ([, set]) => [...set][0];

const assignValidations =
  (validations) => (validationGroup, fieldName, idx) => {
    const validation = validations[idx];

    if (validation) {
      Object.defineProperty(validationGroup, fieldName, {
        get: () => validation,
        enumerable: true,
        configurable: true, // to work with Proxy in makeIsomorphicAPI
      });
    }

    return validationGroup;
  };

const profile = (form, validation) => ({
  form,
  validation,
  [Symbol.toStringTag]: 'ValidationProfile',
});

export default function createProfile(
  selector = '',
  fieldNames = [],
  validations = [],
) {
  const paths = validations
    .map(getItems)
    .map(firstEntry)
    .map(firstItemFromEntrie)
    .map(getPath);

  const validatableForm = ValidatableForm(selector, fieldNames, paths);

  const clonedValidations = validations
    .map(cloneValidation)
    .map(bind(validatableForm, fieldNames))
    .map(makeValidationHandlerFn(validatableForm));

  const groupedValidations = fieldNames.reduce(
    assignValidations(clonedValidations),
    makeGroupValidationsFn(GROUPED)(clonedValidations),
  );

  return profile(
    validatableForm,
    makeValidationHandlerFn(validatableForm)(groupedValidations),
  );
}
