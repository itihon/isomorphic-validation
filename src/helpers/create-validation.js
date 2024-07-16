import { SINGLE, GLUED, GROUPED } from '../constants.js';
import makeGroupValidationsFn from './make-group-validations-fn.js';
import PredicateGroups from '../types/predicate-groups.js';
import ManyToManyMap from '../types/many-to-many-map.js';
import ObservablePredicates from '../types/observable-predicates.js';
import ValidatedItem from '../types/validated-item.js';
import ValidationBuilder from '../types/validation-builder.js';
import clone from './clone.js';

// !consider memoizing this function instead of ValidatedItem to avoid creation multiple Validation
// objects of the same obj/propName conjuction
export default function createValidation(
  obj = {},
  propName = 'value',
  initVal = '',
) {
  const pgs = PredicateGroups();
  const items = ManyToManyMap();
  const containedGroups = ManyToManyMap();
  const TYPE = SINGLE;

  pgs.add(obj, ObservablePredicates());
  items.add(obj, ValidatedItem(obj, propName, initVal));
  containedGroups.add(obj, pgs);

  return ValidationBuilder({ pgs, items, containedGroups, TYPE });
}

// !consider adding createValidation.from() as an immutable analog of .group()
// or maybe something like this
// Validation.group([], {immutable: true})
// Validation.glue([], {immutable: true}) ??? not sure about necessety of this one
createValidation.group = makeGroupValidationsFn(GROUPED);
createValidation.glue = makeGroupValidationsFn(GLUED);
createValidation.clone = (validation) => clone({ validation });
