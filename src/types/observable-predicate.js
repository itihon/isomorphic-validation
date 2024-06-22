import Predicate from './predicate.js';
import ObserverAnd from './observer-and.js';
import ConsoleRepresentation from './console-representation.js';
import indexedName from '../utils/indexed-name.js';

export default function ObservablePredicate(
  predicate = Predicate(),
  items = [],
  keepValid = false,
  anyData = {},
  /*
        Consider putting the debounce functionality here
        as a decoratorFn parameter.

        and later:
        if (typeof decoratorFn === 'function') fn = decoratorFn(fn);

        and in the using function:
        var decorator;
        if (debounce) {
            decorator = fn => debounceP(fn, debounce);
        }
        op = ObservablePredicate(p, items, decorator);
    */
) {
  if (!(predicate instanceof Predicate)) return null;

  const { fn, lastValidCBs, validityCBs } = predicate.valueOf();
  // if (!isFunction(fn)) return null;

  const obs = ObserverAnd();
  const notifySubscribers = obs.update;
  const setValidity = validityCBs.set;
  const representation = ConsoleRepresentation(
    fn.name || indexedName('predicate'),
    {
      ...anyData,
      valid: validityCBs.valid,
      invalid: validityCBs.invalid,
      changed: validityCBs.changed,
      validated: validityCBs.validated,
      keptValid: lastValidCBs.push,
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
        item.getObj(),
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

  let previousMicrotask;

  items.forEach((item) => item.onLastValid(...lastValidCBs));

  function predicatePostExec(result, forbidInvalid) {
    if (forbidInvalid) {
      if (result) {
        items.forEach((item) => item.saveLastValid());
      } else {
        items.forEach((item) => item.retrieveLastValid(validationResult));
        return obsPredicate(!forbidInvalid);
      }
    }
    return setValidity(notifySubscribers(result), validationResult);
  }

  function obsPredicate(forbidInvalid = keepValid, id = undefined) {
    if (previousMicrotask) {
      return previousMicrotask;
    }

    validationResult.target = id;

    const result = fn(...items.map((item) => item.getValue()));

    if (result.then) {
      previousMicrotask = result.then((res) => {
        previousMicrotask = null;
        return predicatePostExec(res, forbidInvalid);
      });

      return previousMicrotask;
    }

    return predicatePostExec(result, forbidInvalid);
  }

  Reflect.setPrototypeOf(obsPredicate, ObservablePredicate.prototype);

  return Object.defineProperties(obsPredicate, {
    toRepresentation: { value: () => representation },
    invalidate: {
      value: () => setValidity(notifySubscribers(false), validationResult),
    },
    getID: { value: obs.getID },
    getValue: { value: obs.getValue },
    onChanged: { value: obs.onChanged },
    invalid: { value: validityCBs.invalid },
    [Symbol.toStringTag]: { value: ObservablePredicate.name },
  });
}
