import createDummyObj from '../utils/createDummyObj.js';
import { ifSide } from '../utils/getenv.js';

export default function ValidatedForm(selector = '', fieldNames = []) {
  return ifSide(
    // server side
    () => {
      const dummyObject = createDummyObj();

      function FormField(name) {
        this.name = name;
        this.value = `${selector}.${name} 42`;
      }
      FormField.prototype = dummyObject;

      function FormFields() {
        Object.defineProperty(this, 'selector', { value: selector });
        fieldNames.forEach((fieldName) => {
          Object.defineProperty(this, fieldName, {
            value: new FormField(fieldName),
            enumerable: true,
          });
        });
        Object.defineProperty(this, Symbol.toStringTag, {
          value: ValidatedForm.name,
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
