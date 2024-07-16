import { GROUPED } from '../constants.js';
import PredicateGroups from '../types/predicate-groups.js';
import ManyToManyMap from '../types/many-to-many-map.js';
import ValidationBuilder from '../types/validation-builder.js';
import accepOnlyValidation from './accept-only-validation.js';

export default function makeGroupValidationsFn(TYPE = GROUPED) {
  return function groupValidations(Validations = [], ...rest) {
    const pgs = PredicateGroups();
    const items = ManyToManyMap();
    const containedGroups = ManyToManyMap();
    const validations = [Validations].concat(rest).flat(Infinity);

    validations.forEach((validation) => {
      accepOnlyValidation(validation);
      const {
        pgs: vPgs,
        items: vItems,
        containedGroups: vContainedGroups,
      } = validation.valueOf();

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
