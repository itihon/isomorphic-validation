import { SINGLE, GLUED, GROUPED, PROPNAME, INITVAL } from '../constants.js';
import makeGroupValidationsFn from './make-group-validations-fn.js';
import clone from './clone.js';
import createProfile from './create-profile.js';
import PredicateGroups from '../types/predicate-groups.js';
import ManyToManyMap from '../types/many-to-many-map.js';
import ObservablePredicates from '../types/observable-predicates.js';
import ValidatableItem from '../types/validatable-item.js';
import ValidationBuilder from '../types/validation-builder.js';
import CloneRegistry from '../types/clone-registry.js';

export default function createValidation(
  obj = { value: 'default' },
  propName = PROPNAME,
  initVal = INITVAL,
) {
  const pgs = PredicateGroups();
  const items = ManyToManyMap();
  const containedGroups = ManyToManyMap();
  const TYPE = SINGLE;

  pgs.add(obj, ObservablePredicates());
  items.add(obj, ValidatableItem(obj, propName, initVal));
  containedGroups.add(obj, pgs);

  return ValidationBuilder({ pgs, items, containedGroups, TYPE });
}

createValidation.group = makeGroupValidationsFn(GROUPED);
createValidation.glue = makeGroupValidationsFn(GLUED);
createValidation.clone = (validation) =>
  clone({ validation, registry: CloneRegistry() });
createValidation.profile = createProfile;
