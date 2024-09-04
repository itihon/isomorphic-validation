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

export default function ObservablePredicate(
  predicate = Predicate(),
  items = [],
  keepValid = false,
  optional = false,
  debounce = 0,
  anyData = {},
) {
  if (!(predicate instanceof Predicate)) return null;

  let restoredCBs;
  let validityCBs;

  const fn = ({ restoredCBs, validityCBs } = predicate.valueOf()).valueOf();
  /**
 * // @bug: optional predicates should be valid by default
 * // if the current validatable values are equal to their init values or undefined
 * // at the moment a predicate is being created 
 * // temporarily fixed
 * // should be fixed like this (tests are needed)
 *  
 *  let initVal = false;
 *  
 *  if (optional) {
 *    const keys = items.map(item => item.preserveValue());  

 *    const isInitVal = items
 *      .map((item) => item.isInitValue())
 *      .every((value) => value === true);
 *    
 *    initVal = isInitVal;
 *  }
 * 
 *  const obs = ObserverAnd(initVal);
 */
  const obs = ObserverAnd(optional); // optional predicates are valid by default
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
      target: { writable: true },
      isValid: { get: obs.getValue },
    },
  );

  const predicateFn = debounce && IS_CLIENT ? debounceP(fn, debounce) : fn;

  obs.onChanged((result) => validityCBs.change(result, validationResult));
  items.forEach((item) => item.onRestored(...restoredCBs));

  function predicatePostExec(result, forbidInvalid) {
    acceptOnlyBoolean(result);
    notifySubscribers(result);
    if (forbidInvalid) {
      if (ValidatableItem.keepValid(items, validationResult)) {
        return obsPredicate(!forbidInvalid);
      }
    }
    return setValidity(result, validationResult);
  }

  function obsPredicate(
    forbidInvalid = keepValid,
    target = undefined,
    callID = undefined,
  ) {
    validationResult.target = target;

    validityCBs.start(validationResult);

    if (optional) {
      const isInitVal = items
        .map((item) => item.isInitValue())
        .every((value) => value === true);

      if (isInitVal) {
        return predicatePostExec(true, forbidInvalid);
      }
    }

    const result = predicateFn(...items.map((item) => item.getValue(callID)));

    if (result && result.then) {
      return result.then((res) => predicatePostExec(res, forbidInvalid));
    }

    return predicatePostExec(result, forbidInvalid);
  }

  Reflect.setPrototypeOf(obsPredicate, ObservablePredicate.prototype);

  return Object.defineProperties(obsPredicate, {
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
          optional,
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
