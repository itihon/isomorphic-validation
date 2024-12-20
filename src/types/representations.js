import ManyToManyMap from './many-to-many-map.js';
import indexedName from '../utils/indexed-name.js';
import ObserverAnd from './observer-and.js';
import Predicate from './predicate.js';
import preventPropNamesClash from '../helpers/prevent-prop-names-clash.js';

export function PredicateGroupsRepresentation(obs = ObserverAnd()) {
  const pgs = ManyToManyMap();
  const view = Object.getPrototypeOf(pgs);

  Object.defineProperties(view, {
    isValid: { get: obs.getValue },
    [Symbol.iterator]: {
      value() {
        const values = [];
        view.forEach((value, key) => values.push([key, value]));
        return values[Symbol.iterator]();
      },
    },
    forEach: {
      value(cbfunction = (/* value, key, values */) => {}) {
        [...view.entries()].forEach(([key, set]) => {
          set.forEach((predicates) => {
            predicates.forEach((predicate) => cbfunction(predicate, key, view));
          });
        });
      },
    },
    toJSON: {
      value() {
        return [...pgs].reduce(
          (acc, [key, set]) => {
            acc[key.name || indexedName('object')] = [...set];
            return acc;
          },
          {
            // name: representation[Symbol.toStringTag],
            isValid: this.isValid,
          },
        );
      },
    },
  });

  return Object.defineProperties(pgs, {
    toRepresentation: {
      value() {
        return view;
      },
    },
  });
}

export function ObservablePredicatesRepresentation(obs = ObserverAnd()) {
  return Object.defineProperties([], {
    isValid: {
      get: obs.getValue,
      configurable: true,
    },
    toJSON: {
      value() {
        return {
          name: this[Symbol.toStringTag],
          length: this.length,
          ...this,
          isValid: obs.getValue(),
        };
      },
    },
    [Symbol.toStringTag]: { value: 'PredicateGroup' },
  });
}

export function ObservablePredicateRepresentation(
  obs = ObserverAnd(),
  predicate = Predicate(),
  fnName = '',
  anyData = {},
) {
  const representation = Object.defineProperties(
    {},
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
      ...Object.getOwnPropertyDescriptors(predicate),
      [Symbol.toStringTag]: { value: fnName },
    },
  );

  preventPropNamesClash(anyData, representation);

  return Object.assign(representation, anyData);
}

// !JSON representation should be generated in advance.
// ! when toJSON is being called, the representation should be ready to use
export function ValidationResult(representation = new Map()) {
  return Object.defineProperties(representation, {
    target: { writable: true, configurable: true },
    type: { writable: true },
    [Symbol.toStringTag]: { value: 'ValidationResult' },
  });
}
