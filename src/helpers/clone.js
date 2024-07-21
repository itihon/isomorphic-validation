import CloneRegistry from '../types/clone-registry.js';
import ValidationBuilder from '../types/validation-builder.js';
import memoize from '../utils/memoize.js';
import accepOnlyValidation from './accept-only-validation.js';

const buildValidation = memoize(
  (pgs, items, containedGroups, TYPE, validations) =>
    ValidationBuilder({
      pgs,
      items,
      containedGroups,
      TYPE,
      validations,
    }),
  undefined,
  4, // parameter validations is not accounted since it is always a new set
);

export default function clone({ validation, registry = CloneRegistry() }) {
  accepOnlyValidation(validation);
  const { pgs, items, containedGroups, TYPE } = validation.valueOf();
  const { validations } = validation; // Set()

  const clonedPgs = registry.cloneOnce(pgs, registry);

  const clonedItems = registry.cloneMap(items);

  const clonedContainedGroups = registry.cloneMapOnce(
    containedGroups,
    registry,
  );

  const clonedValidations = [...validations]
    .map((v) => ({ validation: v, registry }))
    .map(clone);

  return buildValidation(
    clonedPgs,
    clonedItems,
    clonedContainedGroups,
    TYPE,
    clonedValidations,
  );
}
