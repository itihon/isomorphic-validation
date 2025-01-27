import Functions from './functions.js';

const setPrototypeOf = (obj, proto) => {
  Reflect.setPrototypeOf(obj, proto);
  return obj;
};

export default function StateCallbacks(CBs = StateCallbacks({})) {
  let {
    startedCBs,
    validCBs,
    invalidCBs,
    changedCBs,
    validatedCBs,
    restoredCBs,
    errorCBs,
  } = CBs ? CBs.valueOf() : {};

  let argForStartedCBs;
  let argForValidCBs;
  let argForInvalidCBs;
  let argForChangedCBs;
  let argForValidatedCBs;
  let argForRestoredCBs;

  startedCBs = Functions(startedCBs);
  validCBs = Functions(validCBs);
  invalidCBs = Functions(invalidCBs);
  changedCBs = Functions(changedCBs);
  validatedCBs = Functions(validatedCBs);
  restoredCBs = Functions(restoredCBs);
  errorCBs = Functions(errorCBs);

  return {
    runStarted() {
      startedCBs.run(argForStartedCBs);
    },
    runValid() {
      validCBs.run(argForValidCBs);
    },
    runInvalid() {
      invalidCBs.run(argForInvalidCBs);
    },
    runChanged() {
      changedCBs.run(argForChangedCBs);
    },
    runValidated() {
      validatedCBs.run(argForValidatedCBs);
    },
    runRestored() {
      restoredCBs.run(argForRestoredCBs);
    },
    setArg(arg) {
      [
        argForStartedCBs,
        argForValidCBs,
        argForInvalidCBs,
        argForChangedCBs,
        argForValidatedCBs,
        argForRestoredCBs,
      ] = [
        setPrototypeOf({ type: 'started' }, arg),
        setPrototypeOf({ type: 'valid' }, arg),
        setPrototypeOf({ type: 'invalid' }, arg),
        setPrototypeOf({ type: 'changed' }, arg),
        setPrototypeOf({ type: 'validated' }, arg),
        setPrototypeOf({ type: 'restored' }, arg),
      ];
    },
    valueOf() {
      return {
        startedCBs,
        validCBs,
        invalidCBs,
        changedCBs,
        validatedCBs,
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
    error: errorCBs.push,
    runError: errorCBs.run,
    [Symbol.toStringTag]: 'StateCallbacks',
  };
}
