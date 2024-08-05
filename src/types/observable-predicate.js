import Predicate from './predicate.js';
import ObserverAnd from './observer-and.js';
import ConsoleRepresentation from './console-representation.js';
import indexedName from '../utils/indexed-name.js';
import ValidatableItem from './validatable-item.js';
import CloneRegistry from './clone-registry.js';
import Functions from './functions.js';
import acceptOnlyBoolean from '../helpers/accept-only-boolean.js';

export default function ObservablePredicate(
  predicate = Predicate(),
  items = [],
  keepValid = false,
  optional = false,
  anyData = {},
) {
  if (!(predicate instanceof Predicate)) return null;

  let restoredCBs;
  let validityCBs;

  const fn = ({ restoredCBs, validityCBs } = predicate.valueOf()).valueOf();

  const obs = ObserverAnd();
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
      restored: restoredCBs.push,
      // !consider for adding: started, deferred (or delayed), canceled???
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

  items.forEach((item) => item.onRestored(...restoredCBs));

  function predicatePostExec(result, forbidInvalid) {
    acceptOnlyBoolean(result);
    notifySubscribers(result);
    if (forbidInvalid) {
      // if (result) {
      //   items.forEach((item) => item.saveValue());
      // } else {
      // !!! At this point validationResult is not determined.
      // !!! this is the result of the previous validation
      //   items.forEach((item) => item.restoreValue(validationResult));
      //   return obsPredicate(!forbidInvalid);
      // }
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

    if (optional) {
      const isInitVal = items
        .map((item) => item.isInitValue())
        .every((value) => value === true);

      if (isInitVal) {
        return predicatePostExec(true, forbidInvalid);
      }
    }

    const result = fn(...items.map((item) => item.getValue(callID)));

    if (result && result.then) {
      return result.then((res) => predicatePostExec(res, forbidInvalid));
    }

    return predicatePostExec(result, forbidInvalid);
  }

  Object.defineProperty(obsPredicate, 'name', { value: `${fnName}_OP` });

  Reflect.setPrototypeOf(obsPredicate, ObservablePredicate.prototype);

  return Object.defineProperties(obsPredicate, {
    toRepresentation: { value: () => representation },
    invalidate: {
      value: () => setValidity(notifySubscribers(false), validationResult),
    },
    clone: {
      value: (registry = CloneRegistry()) =>
        ObservablePredicate(
          Predicate(predicate),
          items.map((item) => registry.cloneOnce(item)),
          keepValid,
          optional,
          anyData,
        ),
    },
    getID: { value: obs.getID },
    getValue: { value: obs.getValue },
    onChanged: { value: obs.onChanged },
    onInvalid: { value: onInvalidCBs.push },
    [Symbol.toStringTag]: { value: ObservablePredicate.name },
  });
}
