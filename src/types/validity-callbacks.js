import Functions from './functions.js';

const setPrototypeOf = (obj, proto) => {
  Reflect.setPrototypeOf(obj, proto);
  return obj;
};

// !refactor to ValidityEvents
// set() -> emit()
export default function ValidityCallbacks(
  initVal = false,
  CBs = ValidityCallbacks(false, {}),
) {
  let cbArg = {};
  let isValid = initVal;
  let {
    validCBs,
    invalidCBs,
    changedCBs,
    validatedCBs,
    startedCBs,
    restoredCBs,
    errorCBs,
  } = CBs ? CBs.valueOf() : {};

  let argForValidCBs;
  let argForInvalidCBs;
  let argForChangedCBs;
  let argForValidatedCBs;
  let argForStartedCBs;
  let argForRestoredCBs;

  validCBs = Functions(validCBs);
  invalidCBs = Functions(invalidCBs);
  changedCBs = Functions(changedCBs);
  validatedCBs = Functions(validatedCBs);
  startedCBs = Functions(startedCBs);
  restoredCBs = Functions(restoredCBs);
  errorCBs = Functions(errorCBs);

  return {
    set(value = false) {
      if (value) {
        // cbArg.type = 'valid';
        validCBs.run(argForValidCBs);
      } else {
        // cbArg.type = 'invalid';
        invalidCBs.run(argForInvalidCBs);
      }

      isValid = value;

      // cbArg.type = 'validated';
      validatedCBs.run(argForValidatedCBs);

      return isValid;
    },
    change(value = false) {
      isValid = value;
      // cbArg.type = 'changed';
      changedCBs.run(argForChangedCBs);
      return isValid;
    },
    valueOf() {
      return {
        validCBs,
        invalidCBs,
        changedCBs,
        validatedCBs,
        startedCBs,
        restoredCBs,
        errorCBs,
      };
    },
    start() {
      // cbArg.type = 'started';
      startedCBs.run(argForStartedCBs);
    },
    restore() {
      restoredCBs.run(argForRestoredCBs);
    },
    setArg(arg) {
      cbArg = arg;
      [
        argForValidCBs,
        argForInvalidCBs,
        argForChangedCBs,
        argForValidatedCBs,
        argForStartedCBs,
        argForRestoredCBs,
      ] = [
        setPrototypeOf({ type: 'valid' }, cbArg),
        setPrototypeOf({ type: 'invalid' }, cbArg),
        setPrototypeOf({ type: 'changed' }, cbArg),
        setPrototypeOf({ type: 'validated' }, cbArg),
        setPrototypeOf({ type: 'started' }, cbArg),
        setPrototypeOf({ type: 'restored' }, cbArg),
      ];
    },
    started: startedCBs.push,
    valid: validCBs.push,
    invalid: invalidCBs.push,
    changed: changedCBs.push,
    validated: validatedCBs.push,
    restored: restoredCBs.push,
    catch: errorCBs.run,
    error: errorCBs.push,
    [Symbol.toStringTag]: ValidityCallbacks.name,
  };
}
