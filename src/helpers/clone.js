import ManyToManyMap from '../types/many-to-many-map.js';
import PredicateGroups from '../types/predicate-groups.js';
import ValidationBuilder from '../types/validation-builder.js';

// traverse validations, create a new pgs, remove its observable predicates with the cloned ones
// remove pgs in clonedContained groups with the newly created
// remove validation with newly created
// repeat steps for nested validations
export default function clone({ validation, upperPgs }) {
  const { pgs, items, containedGroups, TYPE } = validation.valueOf();
  const { validations } = validation; // Set()

  let clonedPgs;
  const clonedContainedGroups = ManyToManyMap();

  if (upperPgs === undefined) {
    // topmost validation
    clonedPgs = pgs.clone();
  } else {
    // nested validation
    clonedPgs = PredicateGroups();

    pgs.forEach((_, key) => {
      if (upperPgs.has(key)) {
        upperPgs.get(key).forEach((group) => clonedPgs.add(key, group));
      }
    });
  }

  const clonedValidations = [...validations]
    .map((v) => ({ validation: v, upperPgs: clonedPgs }))
    .map(clone);

  const clonedItems = items.map((item) => item.clone());

  clonedItems.forEach((_, key) => clonedContainedGroups.add(key, pgs));

  containedGroups.forEach((groups, key) =>
    clonedContainedGroups.add(key, groups),
  );

  return ValidationBuilder({
    pgs: clonedPgs,
    items: clonedItems,
    containedGroups: clonedContainedGroups,
    TYPE,
    validations: clonedValidations,
  });
}
