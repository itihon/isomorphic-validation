import { GLUED, GROUPED } from '../constants.js';
import PredicateGroups from '../types/predicate-groups.js';
import ManyToManyMap from '../types/many-to-many-map.js';
import ValidationBuilder from '../types/validation-builder.js';
import accepOnlyValidation from './accept-only-validation.js';

export default function makeGroupValidationsFn(TYPE = GROUPED) {
  return function groupValidations(Validations = [], ...rest) {
    const pgs = PredicateGroups(undefined, undefined, TYPE);
    const items = ManyToManyMap();
    const containedGroups = ManyToManyMap();
    const validations = [
      ...new Set([Validations].concat(rest).flat(Infinity)),
    ].map(accepOnlyValidation);

    validations
      .map((validation) => {
        const {
          pgs: vPgs,
          items: vItems,
          containedGroups: vContainedGroups,
        } = validation.valueOf();

        pgs.mergeWith(vPgs);
        items.mergeWith(vItems);
        containedGroups.mergeWith(vContainedGroups);

        return vItems;
      })
      .forEach((vItems) => {
        if (TYPE === GLUED) {
          vItems.mergeWith(items);
        }
      });

    containedGroups.forEach((_, key) => {
      containedGroups.add(key, pgs);
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
