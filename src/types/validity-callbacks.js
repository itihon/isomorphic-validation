import Functions from './functions.js';

// !refactor to ValidityEvents
// set() -> emit()
export default function ValidityCallbacks(
  initVal = false,
  CBs = ValidityCallbacks(false, {}),
) {
  let isValid = initVal;
  let { validCBs, invalidCBs, changedCBs, validatedCBs, startedCBs } = CBs
    ? CBs.valueOf()
    : {};

  validCBs = Functions(validCBs);
  invalidCBs = Functions(invalidCBs);
  changedCBs = Functions(changedCBs);
  validatedCBs = Functions(validatedCBs);
  startedCBs = Functions(startedCBs);

  return {
    set(value = false, cbArgs = undefined) {
      if (value) {
        validCBs.run(cbArgs);
      } else {
        invalidCBs.run(cbArgs);
      }

      isValid = value;

      validatedCBs.run(cbArgs);

      return isValid;
    },
    change(value = false, cbArgs = undefined) {
      isValid = value;
      changedCBs.run(cbArgs);
      return isValid;
    },
    valueOf() {
      return { validCBs, invalidCBs, changedCBs, validatedCBs, startedCBs };
    },
    start: startedCBs.run,
    started: startedCBs.push,
    valid: validCBs.push,
    invalid: invalidCBs.push,
    changed: changedCBs.push,
    validated: validatedCBs.push,
    [Symbol.toStringTag]: ValidityCallbacks.name,
  };
}
