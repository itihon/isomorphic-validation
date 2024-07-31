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
        this.selector = selector;
        fieldNames.forEach((fieldName) => {
          this[fieldName] = new FormField(fieldName);
        });
        this[Symbol.toStringTag] = ValidatedForm.name;
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
