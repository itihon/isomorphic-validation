import ObserverAnd from './observer-and.js';
import Functions from './functions.js';
import ConsoleRepresentation from './console-representation.js';
import ObservablePredicate from './observable-predicate.js';
import debounceP from '../utils/debounce-p.js';
import runPredicatesQueue from '../helpers/run-predicates-queue.js';
import CloneRegistry from './clone-registry.js';
import { IS_CLIENT } from '../utils/getenv.js';

export default function ObservablePredicates() {
  const obs = ObserverAnd(true); // absense of predicates means valid state of Validation
  const predicates = Functions();
  const currOf = (arr = []) => arr[arr.length - 1];
  // const prevOf = (arr = []) => arr[arr.length - 2];
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
      add(
        predicate = ObservablePredicate(),
        { next = true, debounce = 0 } = {},
      ) {
        if (!(predicate instanceof ObservablePredicate)) return this;

        obs.subscribe(predicate);

        predicates.push(
          debounce && IS_CLIENT ? debounceP(predicate, debounce) : predicate,
        );

        queueRules.push(next);
        withQueueRules = withQueueRules || !next;
        representation.push(predicate.toRepresentation());

        if (lastStopPredicate) {
          lastStopPredicate.onInvalid(
            currOf(predicates).cancel,
            predicate.invalidate,
          );
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
            let debounce;
            const obsPredicate = ({ delay: debounce } =
              predicate.valueOf()).valueOf();

            const clonedPredicate = registry.cloneOnce(obsPredicate, registry);

            return [clonedPredicate, { next: queueRules[idx], debounce }];
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
