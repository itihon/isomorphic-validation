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
          keepValid = false,
          optional = false,
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
            optional,
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
      bind(newObj = {}, path = undefined, initVal = undefined) {
        if (TYPE !== SINGLE) {
          throw new Error('Only single validation can be bound');
        }

        const [oldObj, set] = items.entries().next().value; // firstEntrie
        const validatableItem = [...set][0]; // firstItemFromEntrie

        const newPath = path !== undefined ? path : validatableItem.getPath();

        const newInitVal =
          initVal !== undefined ? initVal : validatableItem.getInitValue();

        validatableItem.setObject(newObj, newPath, newInitVal);

        items.changeKey(oldObj, newObj);
        pgs.changeKey(oldObj, newObj);
        containedGroups.changeKey(oldObj, newObj);

        return this;
      },
      valueOf() {
        return { pgs, items, containedGroups, TYPE };
      },
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
