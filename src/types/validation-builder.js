import { INITVAL, PROPNAME, SINGLE } from '../constants.js';
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
        const validatableItems =
          target !== undefined ? items.get(target) : items.getAll();

        const callID = Symbol('callID');
        validatableItems.forEach((item) => item.preserveValue(callID));

        return pgs.run(target, callID).then((res) => {
          validatableItems.forEach((item) => item.clearValue(callID));

          (containedGroups.get(target) || containedGroups.getAll()).forEach(
            (containedPgs) => {
              containedPgs.runCBs(
                containedPgs.isValid,
                containedPgs.toRepresentation(target),
              );
            },
          );

          return Object.create(pgs.toRepresentation(target), {
            isValid: { value: res },
          });
        });
      },
      bind(newObj = {}, propName = PROPNAME, initVal = INITVAL) {
        if (TYPE !== SINGLE) {
          throw new Error('Only single validation can be bound');
        }

        const [oldObj, set] = items.entries().next().value;
        const validatedItem = [...set][0];

        validatedItem.setObject(newObj, propName, initVal);
        items.changeKey(oldObj, newObj);
        pgs.changeKey(oldObj, newObj);
        containedGroups.changeKey(oldObj, newObj);

        return this;
      },
      valueOf() {
        return { pgs, items, containedGroups, TYPE };
      },
      // constraints: new Map(pgs.toRepresentation()),
      constraints: pgs.toRepresentation(),
      validations,
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
