import Functions from './functions.js';

const setPrototypeOf = (obj, proto) => {
  Reflect.setPrototypeOf(obj, proto);
  return obj;
};

// !refactor to ValidityEvents
// set() -> emit()
export default function StateCallbacks(CBs = StateCallbacks({})) {
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
        validCBs.run(argForValidCBs);
      } else {
        invalidCBs.run(argForInvalidCBs);
      }

      validatedCBs.run(argForValidatedCBs);

      return value;
    },
    change() {
      changedCBs.run(argForChangedCBs);
    },
    start() {
      startedCBs.run(argForStartedCBs);
    },
    restore() {
      restoredCBs.run(argForRestoredCBs);
    },
    setArg(arg) {
      [
        argForValidCBs,
        argForInvalidCBs,
        argForChangedCBs,
        argForValidatedCBs,
        argForStartedCBs,
        argForRestoredCBs,
      ] = [
        setPrototypeOf({ type: 'valid' }, arg),
        setPrototypeOf({ type: 'invalid' }, arg),
        setPrototypeOf({ type: 'changed' }, arg),
        setPrototypeOf({ type: 'validated' }, arg),
        setPrototypeOf({ type: 'started' }, arg),
        setPrototypeOf({ type: 'restored' }, arg),
      ];
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
    started: startedCBs.push,
    valid: validCBs.push,
    invalid: invalidCBs.push,
    changed: changedCBs.push,
    validated: validatedCBs.push,
    restored: restoredCBs.push,
    catch: errorCBs.run,
    error: errorCBs.push,
    [Symbol.toStringTag]: StateCallbacks.name,
  };
}
