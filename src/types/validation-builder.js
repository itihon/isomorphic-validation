import { SINGLE } from '../constants.js';
import PredicateGroups from './predicate-groups.js';
import ManyToManyMap from './many-to-many-map.js';
import Predicate from './predicate.js';
import addObservablePredicate from '../helpers/add-observable-predicate.js';
import firstEntry from '../utils/firstEntry.js';
import makeIsomorphicAPI from '../utils/make-isomorphic-api.js';
import makeValidationHandlerFn from '../helpers/make-validation-handler-fn.js';
import tryCatch from '../utils/try-catch.js';

export default function ValidationBuilder({
  pgs = PredicateGroups(),
  items = ManyToManyMap(),
  containedGroups = new ManyToManyMap(),
  TYPE = SINGLE,
  validations = [],
} = {}) {
  const api = makeValidationHandlerFn(null)({
    constraint(
      validator = Predicate(),
      { next = true, debounce = 0, keepValid = false, ...anyData } = {},
    ) {
      const predicate = Predicate(validator);
      pgs.forEach(
        addObservablePredicate(predicate, items, {
          TYPE,
          next,
          debounce,
          keepValid,
          anyData,
          groups: pgs.getAll(),
        }),
      );
      return this;
    },

    validate(target) {
      if (target !== undefined && !pgs.has(target)) {
        const { warn } = console;

        warn(
          `There are no predicates associated with the target: ${[]
            .concat(
              Object(target).name || [],
              JSON.stringify(target) || typeof target,
              Object(target)[Symbol.toStringTag] || [],
            )
            .join(' ')}.`,
        );

        return Promise.resolve(
          Object.create(pgs.result(), {
            isValid: { value: null },
            type: { value: 'validated' },
          }),
        );
      }
      // all items will be preserved regardless of the target
      // not the most optimal way, but fixes the bug with validating a glued validation
      // by target through a grouping validation
      const validatableItems = items.getAll();
      // target !== undefined ? items.get(target) : items.getAll();

      const callID = Symbol('callID');

      validatableItems.forEach((item) => item.preserveValue(callID));

      if (TYPE !== SINGLE) {
        pgs.setGroupTarget(target);
      }

      // ! a better solution would be to run all grouping validations' started callbacks first
      pgs.startCBs(); // run startCBs of the grouping validation first

      const containedPgsSet =
        containedGroups.get(target) || containedGroups.getAll();

      containedPgsSet.forEach((containedPgs) => {
        if (containedPgs !== pgs) {
          containedPgs.startCBs();
        }
      });

      return pgs.run(target, callID).then((res) => {
        validatableItems.forEach((item) => item.clearValue(callID));

        containedPgsSet.forEach((containedPgs) => {
          containedPgs.runCBs(containedPgs.isValid);
        });

        return Object.create(pgs.result(), {
          isValid: { value: res },
          type: { value: 'validated' },
        });
      });
    },

    bind(newObj = {}, { path = undefined, initValue = undefined } = {}) {
      if (TYPE !== SINGLE) {
        throw new Error('Only single validation can be bound');
      }

      const [oldObj, set] = firstEntry(items);
      const validatableItem = [...set][0]; // firstItemFromEntrie

      const newPath = path !== undefined ? path : validatableItem.getPath();

      const newInitVal =
        initValue !== undefined ? initValue : validatableItem.getInitValue();

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
    started: pgs.started,
    error: pgs.error,
  });

  Object.defineProperties(api, {
    [Symbol.toStringTag]: { value: 'Validation' },
    isValid: Object.getOwnPropertyDescriptor(pgs, 'isValid'),
  });

  api.validate = tryCatch(
    api.validate,
    pgs.catchCBs,
    pgs.enableCatch,
    () => Promise.resolve(pgs.result()), // if the catch function is also faulty, return ValidationResult and swallow the error
    () => Promise.resolve(pgs.result()), // return ValidationResult on any error occurance
    true, // promisify sync errors
  );

  return makeIsomorphicAPI(api);
}
