import ObserverAnd from './observer-and.js';
import Functions from './functions.js';
import ConsoleRepresentation from './console-representation.js';
import ObservablePredicate from './observable-predicate.js';
import runPredicatesQueue from '../helpers/run-predicates-queue.js';
import CloneRegistry from './clone-registry.js';

export default function ObservablePredicates() {
  const obs = ObserverAnd();
  const predicates = Functions();
  const queueRules = [];
  let withQueueRules = false;
  let lastStopPredicate;

  const representation = ConsoleRepresentation('Predicates', [], {
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
  });

  return Object.defineProperties(
    {
      add(predicate = ObservablePredicate(), { next = true } = {}) {
        if (!(predicate instanceof ObservablePredicate)) return this;

        obs.subscribe(predicate);
        predicates.push(predicate);
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
        return withQueueRules
          ? runPredicatesQueue(predicates, queueRules, args)
          : Promise.all(predicates.run(...args));
      },
      clone(registry = CloneRegistry()) {
        return predicates
          .map((predicate, idx) => {
            const clonedPredicate = registry.cloneOnce(predicate, registry);
            return [clonedPredicate, { next: queueRules[idx] }];
          })
          .reduce(
            (ops, predWithParams) => ops.add(...predWithParams),
            ObservablePredicates(),
          );
      },
      toRepresentation() {
        return representation;
      },
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
