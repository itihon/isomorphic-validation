import Functions from './functions.js';

// !refactor to ValidityEvents
// set() -> emit()
export default function ValidityCallbacks(
  initVal = false,
  CBs = ValidityCallbacks(false, {}),
) {
  let isValid = initVal;
  let { validCBs, invalidCBs, changedCBs, validatedCBs } = CBs
    ? CBs.valueOf()
    : {};

  validCBs = Functions(validCBs);
  invalidCBs = Functions(invalidCBs);
  changedCBs = Functions(changedCBs);
  validatedCBs = Functions(validatedCBs);

  return {
    set(value = false, cbArgs = undefined) {
      if (value) {
        validCBs.run(cbArgs);
      } else {
        invalidCBs.run(cbArgs);
      }

      // if (isValid !== value) {
      isValid = value;
      //   changedCBs.run(cbArgs);
      // }

      validatedCBs.run(cbArgs);

      return isValid;
    },
    change(value = false, cbArgs = undefined) {
      isValid = value;
      changedCBs.run(cbArgs);
      return isValid;
    },
    valueOf() {
      return { validCBs, invalidCBs, changedCBs, validatedCBs };
    },
    valid: validCBs.push,
    invalid: invalidCBs.push,
    changed: changedCBs.push,
    validated: validatedCBs.push,
    // !consider for adding: validated
    [Symbol.toStringTag]: ValidityCallbacks.name,
  };
}
