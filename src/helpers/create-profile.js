import { GROUPED } from '../constants';
import CloneRegistry from '../types/clone-registry';
import ValidatableForm from '../types/validatable-form';
import clone from './clone';
import makeGroupValidationsFn from './make-group-validations-fn';
import makeValidationHandlerFn from './make-validation-handler-fn';
import firstEntry from '../utils/firstEntry.js';
import accepOnlyValidation from './accept-only-validation';

const cloneValidation = (validation) =>
  clone({ validation, registry: CloneRegistry() });

const bind = (form, fieldNames) => (validation, idx) =>
  validation.bind(form.elements[fieldNames[idx]]);

const getItems = (validation) => validation.valueOf().items;
const toPathsAndInitValues = ([paths, initValues], validatableItem) => [
  [...paths, validatableItem.getPath()],
  [...initValues, validatableItem.getInitValue()],
];
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

const profile = (form, validation) =>
  Object.defineProperties(
    { form, validation },
    {
      0: { value: form },
      1: { value: validation },
      length: { value: 2 },
      [Symbol.iterator]: { value: Array.prototype[Symbol.iterator] },
      [Symbol.toStringTag]: { value: 'ValidationProfile' },
    },
  );

export default function createProfile(
  selector = '',
  fieldNames = [],
  validations = [],
) {
  const [paths, initValues] = []
    .concat(validations)
    .map(accepOnlyValidation)
    .map(getItems)
    .map(firstEntry)
    .map(firstItemFromEntrie)
    .reduce(toPathsAndInitValues, [[], []]);

  const validatableForm = ValidatableForm(
    selector,
    fieldNames,
    paths,
    initValues,
  );

  const clonedValidations = []
    .concat(validations)
    .map(cloneValidation)
    .map(bind(validatableForm, fieldNames))
    .map(makeValidationHandlerFn(validatableForm));

  const groupedValidations = []
    .concat(fieldNames)
    .reduce(
      assignValidations(clonedValidations),
      makeGroupValidationsFn(GROUPED)(clonedValidations),
    );

  return profile(
    validatableForm,
    makeValidationHandlerFn(validatableForm)(groupedValidations),
  );
}
