import createDummyObj from '../utils/createDummyObj.js';
import { ifSide } from '../utils/getenv.js';

export default function ValidationProfile(
  selector = '',
  fieldNames = [],
  anyData = {},
) {
  const form = ifSide(
    () => {
      // server side
      const dummyObject = createDummyObj();

      function FormField() {
        this.value = '';
      }
      FormField.prototype = dummyObject;

      function FormFields() {
        fieldNames.forEach((fieldName) => {
          this[fieldName] = new FormField();
        });
      }
      FormFields.prototype = dummyObject;

      return new FormFields();
    },
    () => {
      // client side
      const htmlForm = document.querySelector(selector);

      if (!htmlForm) {
        throw new Error(
          `Cannot find a form with the specified selector: ${selector}`,
        );
      }

      return htmlForm;
    },
  )();

  return {
    ...anyData,
    form,
    [Symbol.toStringTag]: ValidationProfile.name,
  };
}
