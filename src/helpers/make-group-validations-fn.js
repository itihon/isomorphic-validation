import { GROUPED } from '../constants.js';
import PredicateGroups from '../types/predicate-groups.js';
import ManyToManyMap from '../types/many-to-many-map.js';
import ValidationBuilder from '../types/validation-builder.js';

export default function makeGroupValidationsFn(TYPE = GROUPED) {
  return function groupValidations(validations = []) {
    const pgs = PredicateGroups();
    const items = ManyToManyMap();
    const containedGroups = ManyToManyMap();

    validations.forEach((validation) => {
      const {
        pgs: vPgs,
        items: vItems,
        containedGroups: vContainedGroups,
      } = ValidationBuilder.registry.get(validation);

      pgs.mergeWith(vPgs);
      items.mergeWith(vItems);

      containedGroups.mergeWith(vContainedGroups).forEach((_, key) => {
        containedGroups.add(key, pgs);
      });
    });

    return ValidationBuilder({
      pgs,
      items,
      containedGroups,
      TYPE,
      validations,
    });
  };
}
