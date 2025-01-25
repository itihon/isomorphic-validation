import Functions from './functions.js';

// !refactor to ValidityEvents
// set() -> emit()
export default function ValidityCallbacks(
  initVal = false,
  CBs = ValidityCallbacks(false, {}),
) {
  let cbArg = {};
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
    set(value = false) {
      if (value) {
        cbArg.type = 'valid';
        validCBs.run(cbArg);
      } else {
        cbArg.type = 'invalid';
        invalidCBs.run(cbArg);
      }

      isValid = value;

      cbArg.type = 'validated';
      validatedCBs.run(cbArg);

      return isValid;
    },
    change(value = false) {
      isValid = value;
      cbArg.type = 'changed';
      changedCBs.run(cbArg);
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
    start() {
      cbArg.type = 'started';
      startedCBs.run(cbArg);
    },
    setArg(arg) {
      cbArg = arg;
    },
    started: startedCBs.push,
    valid: validCBs.push,
    invalid: invalidCBs.push,
    changed: changedCBs.push,
    validated: validatedCBs.push,
    catch: errorCBs.run,
    error: errorCBs.push,
    [Symbol.toStringTag]: ValidityCallbacks.name,
    id: ValidityCallbacks.id++,
  };
}

ValidityCallbacks.id = 0;
