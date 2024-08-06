import { PROPNAME } from '../constants.js';
import createDummyObj from '../utils/createDummyObj.js';
import { ifSide } from '../utils/getenv.js';

const dummyObject = createDummyObj();

function FormField(fieldName = '', propChain = []) {
  this.name = fieldName;

  propChain.reduce((acc, propName, idx) => {
    const isLast = idx === propChain.length - 1;

    return Object.defineProperty(acc, propName, {
      value: isLast ? '' : {},
      writable: isLast,
    })[propName];
  }, this);
}
FormField.prototype = dummyObject;

export default function ValidatableForm(
  selector = '',
  fieldNames = [],
  paths = [],
  delim = '.',
) {
  return ifSide(
    // server side
    () => {
      function FormFields() {
        Object.defineProperty(this, 'selector', { value: selector });

        fieldNames.forEach((fieldName, idx) => {
          const path = paths[idx];
          const propChain = path ? path.split(delim) : [PROPNAME];

          Object.defineProperty(this, fieldName, {
            value: new FormField(fieldName, propChain),
            enumerable: true,
          });
        });

        Object.defineProperty(this, Symbol.toStringTag, {
          value: ValidatableForm.name,
        });
      }
      FormFields.prototype = dummyObject;

      return new FormFields();
    },
    // client side
    () => {
      const htmlForm = document.querySelector(selector);

      if (!htmlForm) {
        throw new Error(
          `Cannot find a form with the specified selector: ${selector}`,
        );
      }

      return htmlForm;
    },
  )();
}
