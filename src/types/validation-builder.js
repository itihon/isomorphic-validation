import { SINGLE } from '../constants.js';
import PredicateGroups from './predicate-groups.js';
import ManyToManyMap from './many-to-many-map.js';
import ConsoleRepresentation from './console-representation.js';
import Predicate from './predicate.js';
import addObservablePredicate from '../helpers/add-observable-predicate.js';

export default function ValidationBuilder({
  pgs = PredicateGroups(),
  items = ManyToManyMap(),
  containedGroups = new ManyToManyMap(),
  TYPE = SINGLE,
  validations = [],
} = {}) {
  const representation = ConsoleRepresentation(
    'Validation',
    {
      constraint(
        validator = Predicate(),
        {
          next = true,
          debounce = 0,
          // !! consider moving it out since it is not the library's concern
          keepValid = false,
          ...anyData
        } = {},
      ) {
        const predicate = Predicate(validator);
        pgs.forEach(
          addObservablePredicate(predicate, items, {
            TYPE,
            next,
            debounce,
            keepValid,
            anyData,
          }),
        );
        return this;
      },
      validate(target) {
        return pgs.run(target).then((/* res */) => {
          // !!! duplicate of logic
          (containedGroups.get(target) || containedGroups.getAll()).forEach(
            (containedPgs) => {
              containedPgs.runCBs(
                containedPgs.isValid,
                containedPgs.toRepresentation(target),
              );
            },
          );

          return pgs.toRepresentation(target);
        });
      },
      valueOf() {
        return { pgs, items, containedGroups };
      },
      // constraints: new Map(pgs.toRepresentation()),
      constraints: pgs.toRepresentation(),
      validations: new Set(validations),
      valid: pgs.valid,
      invalid: pgs.invalid,
      changed: pgs.changed,
      validated: pgs.validated,
      // !consider for adding: started
    },
    {
      isValid: Object.getOwnPropertyDescriptor(pgs, 'isValid'),
    },
  );

  return Object.freeze(representation);
}
