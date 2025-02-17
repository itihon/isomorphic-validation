import ObserverAnd from './observer-and.js';
import Functions from './functions.js';
import ObservablePredicate from './observable-predicate.js';
import runPredicatesQueue from '../helpers/run-predicates-queue.js';
import CloneRegistry from './clone-registry.js';
import ValidatableItem from './validatable-item.js';
import { ObservablePredicatesRepresentation } from './representations.js';
import acceptOnlyObservablePredicate from '../helpers/accept-only-observable-predicate.js';

const glue = (predicate = ObservablePredicate(), gluedPredicates = []) => {
  if (gluedPredicates.length) {
    const glued = (...args) => {
      const res = predicate(...args);
      gluedPredicates.forEach((gluedPredicate) => gluedPredicate(...args));
      return res;
    };

    return Object.defineProperties(glued, {
      name: { value: `${predicate.name}_GL` },
      valueOf: {
        value: () => ({ gluedPredicates, valueOf: () => predicate }),
      },
    });
  }

  return predicate;
};

export default function ObservablePredicates(
  item = ValidatableItem(),
  optional = false,
) {
  const obs = ObserverAnd(optional); // optional groups are valid by default
  const predicates = Functions();
  const queueRules = [];
  let withQueueRules = false;
  let lastStopPredicate;

  const representation = ObservablePredicatesRepresentation(obs);

  return Object.defineProperties(
    {
      add(
        predicate = ObservablePredicate(),
        { next = true } = {},
        gluedPredicates = [],
      ) {
        acceptOnlyObservablePredicate(predicate);

        obs.subscribe(predicate);
        predicates.push(glue(predicate, gluedPredicates));
        queueRules.push(next);
        withQueueRules = withQueueRules || !next;
        representation.push(predicate.toRepresentation());

        if (lastStopPredicate) {
          lastStopPredicate.onInvalid(predicate.invalidate);
        }

        if (!next) {
          lastStopPredicate = predicate;
        }

        return this;
      },

      run(...args) {
        const isInitValue = item.isInitValue();
        const skip = optional && isInitValue;
        const invalidate = !optional && isInitValue;

        return withQueueRules
          ? runPredicatesQueue(predicates, queueRules, args) // !!! probably aslo should be passed the skip and invalidate variables
          : Promise.all(predicates.run(...args, undefined, skip, invalidate));
      },

      clone(registry = CloneRegistry()) {
        return predicates
          .map((predicate, idx) => {
            let gluedPredicates = [];
            const origPredicate = ({ gluedPredicates } =
              predicate.valueOf()).valueOf();
            const clonedPredicate = registry.cloneOnce(origPredicate, registry);
            const clonedGluedPredicates = registry.cloneMapOnce(
              gluedPredicates,
              registry,
            );
            return [
              clonedPredicate,
              { next: queueRules[idx] },
              clonedGluedPredicates,
            ];
          })
          .reduce(
            (ops, predWithParams) => ops.add(...predWithParams),
            ObservablePredicates(registry.cloneOnce(item), optional),
          );
      },

      toRepresentation() {
        return representation;
      },

      isOptional() {
        return optional;
      },

      getItem: () => item,

      getID: obs.getID,
      getValue: obs.getValue,
      onChanged: obs.onChanged,
      [Symbol.toStringTag]: ObservablePredicates.name,
    },
    {
      isValid: { get: obs.getValue },
    },
  );
}
