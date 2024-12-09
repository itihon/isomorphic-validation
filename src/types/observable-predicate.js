import Predicate from './predicate.js';
import ObserverAnd from './observer-and.js';
import ConsoleRepresentation from './console-representation.js';
import indexedName from '../utils/indexed-name.js';
import ValidatableItem from './validatable-item.js';
import CloneRegistry from './clone-registry.js';
import Functions from './functions.js';
import acceptOnlyBoolean from '../helpers/accept-only-boolean.js';
import { IS_CLIENT } from '../utils/getenv.js';
import debounceP from '../utils/debounce-p.js';
import tryCatch from '../utils/try-catch.js';

export default function ObservablePredicate(
  predicate = Predicate(),
  items = [],
  keepValid = false,
  initState = false,
  debounce = 0,
  anyData = {},
) {
  if (!(predicate instanceof Predicate)) return null;

  let restoredCBs;
  let validityCBs;

  const fn = ({ restoredCBs, validityCBs } = predicate.valueOf()).valueOf();
  const obs = ObserverAnd(initState); // optional predicates are valid by default
  const onInvalidCBs = Functions();

  const notifySubscribers = obs.update;
  const setValidity = (value, cbArgs) => {
    if (!value) {
      onInvalidCBs.run();
    }
    return validityCBs.set(value, cbArgs);
  };
  const fnName = fn.name || indexedName('predicate');
  const representation = ConsoleRepresentation(
    fnName,
    {
      ...anyData,
      valid: validityCBs.valid,
      invalid: validityCBs.invalid,
      changed: validityCBs.changed,
      validated: validityCBs.validated,
      started: validityCBs.started,
      restored: restoredCBs.push,
      error: validityCBs.error,
      // !consider for adding: deferred (or delayed), canceled???
    },
    {
      isValid: { get: obs.getValue },
      toJSON: {
        value() {
          return {
            name: this[Symbol.toStringTag],
            ...anyData,
            isValid: obs.getValue(),
          };
        },
      },
    },
  );
  const validationResult = ConsoleRepresentation(
    'ValidationResult',
    new Map(
      items.map((item) => [
        item.getObject(),
        new Set([
          ConsoleRepresentation('Predicates', [representation], {
            isValid: { get: obs.getValue },
          }),
        ]),
      ]),
    ),
    {
      isValid: { get: obs.getValue },
      target: { writable: true },
      type: { writable: true },
    },
  );

  const predicateFn = debounce && IS_CLIENT ? debounceP(fn, debounce) : fn;

  obs.onChanged((result) => validityCBs.change(result, validationResult));
  items.forEach((item) => item.onRestored(...restoredCBs));

  function predicatePostExec(result, forbidInvalid, target, callID) {
    acceptOnlyBoolean(result);
    notifySubscribers(result);
    if (forbidInvalid) {
      if (ValidatableItem.keepValid(items, validationResult)) {
        items.forEach((item) => item.preserveValue(callID));
        return obsPredicate(!forbidInvalid, target, callID, true);
      }
    }
    return setValidity(result, validationResult);
  }

  function obsPredicate(
    forbidInvalid = keepValid,
    target = undefined,
    callID = undefined,
    revalidate = false,
    skipOptional = false,
  ) {
    validationResult.target = target;

    if (!revalidate) {
      validityCBs.start(validationResult);
    }

    if (skipOptional) {
      return predicatePostExec(true, forbidInvalid, target, callID);
    }

    const result = predicateFn(...items.map((item) => item.getValue(callID)));

    if (result && result.then) {
      return result.then((res) =>
        predicatePostExec(res, forbidInvalid, target, callID),
      );
    }

    return predicatePostExec(result, forbidInvalid, target, callID);
  }

  const obsPredicateTC = tryCatch(
    obsPredicate,
    validityCBs.catch, // the catch function
    () => validityCBs.valueOf().errorCBs.length, // enable the catch function if error state callbacks were added
    () => false, // if the catch function is also faulty, return false and swallow the error
    () => obsPredicateTC.invalidate(), // invalidate on any error occurance
  );

  Reflect.setPrototypeOf(obsPredicateTC, ObservablePredicate.prototype);

  return Object.defineProperties(obsPredicateTC, {
    toRepresentation: { value: () => representation },
    invalidate: {
      value: () => {
        if (debounce) predicateFn.cancel(false);
        return setValidity(notifySubscribers(false), validationResult);
      },
    },
    clone: {
      value: (registry = CloneRegistry()) =>
        ObservablePredicate(
          Predicate(predicate),
          items.map((item) => registry.cloneOnce(item)),
          keepValid,
          initState,
          debounce,
          anyData,
        ),
    },
    getID: { value: obs.getID },
    getValue: { value: obs.getValue },
    onChanged: { value: obs.onChanged },
    onInvalid: { value: onInvalidCBs.push },
    name: { value: `${fnName}_OP` },
    [Symbol.toStringTag]: { value: ObservablePredicate.name },
  });
}
