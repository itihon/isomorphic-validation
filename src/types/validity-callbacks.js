import Functions from './functions.js';

// !refactor to ValidityEvents
// set() -> emit()
export default function ValidityCallbacks(
  initVal = false,
  CBs = ValidityCallbacks(false, {}),
) {
  let isValid = initVal;
  let { validCBs, invalidCBs, changedCBs, validatedCBs, startedCBs, errorCBs } =
    CBs ? CBs.valueOf() : {};

  validCBs = Functions(validCBs);
  invalidCBs = Functions(invalidCBs);
  changedCBs = Functions(changedCBs);
  validatedCBs = Functions(validatedCBs);
  startedCBs = Functions(startedCBs);
  errorCBs = Functions(errorCBs);

  return {
    set(value = false, cbArgs = {}) {
      if (value) {
        cbArgs.type = 'valid';
        validCBs.run(cbArgs);
      } else {
        cbArgs.type = 'invalid';
        invalidCBs.run(cbArgs);
      }

      isValid = value;

      cbArgs.type = 'validated';
      validatedCBs.run(cbArgs);

      return isValid;
    },
    change(value = false, cbArgs = {}) {
      isValid = value;
      cbArgs.type = 'changed';
      changedCBs.run(cbArgs);
      return isValid;
    },
    valueOf() {
      return {
        validCBs,
        invalidCBs,
        changedCBs,
        validatedCBs,
        startedCBs,
        errorCBs,
      };
    },
    start(cbArgs = {}) {
      cbArgs.type = 'started';
      startedCBs.run(cbArgs);
    },
    started: startedCBs.push,
    valid: validCBs.push,
    invalid: invalidCBs.push,
    changed: changedCBs.push,
    validated: validatedCBs.push,
    catch: errorCBs.run,
    error: errorCBs.push,
    [Symbol.toStringTag]: ValidityCallbacks.name,
  };
}
