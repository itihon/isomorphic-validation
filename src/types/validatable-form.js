import { INITVAL, PROPNAME } from '../constants.js';
import acceptOnlyNotEmptyString from '../helpers/accept-only-not-empty-string.js';
import createDummyObj from '../utils/createDummyObj.js';
import { ifSide } from '../utils/getenv.js';

const dummyObject = createDummyObj();

function FormField(fieldName = '', propChain = [], initValue = INITVAL) {
  this.name = fieldName;

  propChain.reduce((acc, propName, idx) => {
    const isLast = idx === propChain.length - 1;

    return Object.defineProperty(acc, propName, {
      value: isLast ? initValue : {},
      writable: isLast,
    })[propName];
  }, this);
}
FormField.prototype = dummyObject;

function FormFields(fieldNames, paths, initValues, delim) {
  [].concat(fieldNames).forEach((fieldName, idx) => {
    acceptOnlyNotEmptyString(fieldName);

    const path = paths[idx];
    const initValue = initValues[idx];
    const propChain = path ? path.split(delim) : [PROPNAME];
    const formField = new FormField(fieldName, propChain, initValue);

    Object.defineProperty(this, fieldName, {
      value: formField,
      enumerable: true,
    });
  });
}
FormFields.prototype = dummyObject;

const createValidatableFormFn =
  (selector, fieldNames, paths, initValues, delim) => () => {
    const fieldsCollection = new FormFields(
      fieldNames,
      paths,
      initValues,
      delim,
    );
    const form = Object.create(
      dummyObject,
      Object.getOwnPropertyDescriptors(fieldsCollection),
    );

    Object.defineProperty(form, 'selector', { value: selector });
    Object.defineProperty(form, 'elements', { value: fieldsCollection });
    Object.defineProperty(form, Symbol.toStringTag, {
      value: ValidatableForm.name,
    });

    return form;
  };

const getFormBySelectorFn = (selector) => () => {
  const htmlForm = document.querySelector(selector);

  if (!htmlForm) {
    throw new Error(
      `Cannot find a form with the specified selector: ${selector}`,
    );
  }

  return htmlForm;
};

export default function ValidatableForm(
  selector = '',
  fieldNames = [],
  paths = [],
  initValues = [],
  delim = '.',
) {
  return ifSide(
    // server side
    createValidatableFormFn(selector, fieldNames, paths, initValues, delim),

    // client side
    getFormBySelectorFn(selector),
  )();
}
