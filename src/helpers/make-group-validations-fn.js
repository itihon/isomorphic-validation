import { GLUED, GROUPED } from '../constants.js';
import PredicateGroups from '../types/predicate-groups.js';
import ManyToManyMap from '../types/many-to-many-map.js';
import ValidationBuilder from '../types/validation-builder.js';
import accepOnlyValidation from './accept-only-validation.js';

export default function makeGroupValidationsFn(TYPE = GROUPED) {
  return function groupValidations(Validations = [], ...rest) {
    const pgs = PredicateGroups();
    const items = ManyToManyMap();
    const containedGroups = ManyToManyMap();
    const validations = [...new Set([Validations].concat(rest).flat(Infinity))];

    validations
      .map((validation) => {
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

        return vItems;
      })
      .forEach((vItems) => {
        if (TYPE === GLUED) {
          vItems.mergeWith(items); // !!! this shouldn't be merging
        }
      });
    /*
        if (TYPE === GLUED) {
          const [obj, set] = firstEntry(vItems);
          items.forEach(item => vItems.add(obj, item));
        }
      */

    return ValidationBuilder({
      pgs,
      items,
      containedGroups,
      TYPE,
      validations,
    });
  };
}
