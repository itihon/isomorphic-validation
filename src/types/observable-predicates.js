import ObserverAnd from './observer-and.js';
import Functions from './functions.js';
import ConsoleRepresentation from './console-representation.js';
import ObservablePredicate from './observable-predicate.js';
import debounceP from '../utils/debounce-p.js';
import runPredicatesQueue from '../helpers/run-predicates-queue.js';

export default function ObservablePredicates() {
  const obs = ObserverAnd(true); // absense of predicates means valid state of Validation
  const predicates = Functions();
  const currOf = (arr = []) => arr[arr.length - 1];
  const prevOf = (arr = []) => arr[arr.length - 2];
  const queueRules = [];
  let withQueueRules = false;
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

        predicates.push(debounce ? debounceP(predicate, debounce) : predicate);
        queueRules.push(next);
        withQueueRules = withQueueRules || !next;
        representation.push(predicate.toRepresentation());

        /* 
                    !!? It probably should be not prevOf but rather the very first one
                    with the parameter next = false, 
                    so all the rest predicates following it 
                    have to be canceled and invalidated in case that one is invalid
                */
        if (prevOf(queueRules) === false) {
          prevOf(predicates)
            .valueOf()
            .invalid(currOf(predicates).cancel, currOf(predicates).invalidate);
        }

        return this;
      },
      run(id) {
        /*
                    !consider using predicate's validityCBs.valid mechanism
                    instead of runPredicatesQueue
                    UPD: Too complicated! validityCBs.set() doesn't wait for
                    valid/invalid/changed CBs to be done, it doesn't use 
                    their result.
                    But we need to wait for all predicates to be done.
                */
        return withQueueRules
          ? runPredicatesQueue(predicates, queueRules)
          : Promise.all(predicates.run(undefined, id));
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
