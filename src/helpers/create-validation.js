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
  { path = PROPNAME, initValue = INITVAL, optional = false } = {},
) {
  const pgs = PredicateGroups();
  const items = ManyToManyMap();
  const containedGroups = ManyToManyMap();
  const TYPE = SINGLE;
  const item = ValidatableItem(obj, path, initValue);

  pgs.add(obj, ObservablePredicates(item, optional));
  items.add(obj, item);
  containedGroups.add(obj, pgs);

  return ValidationBuilder({ pgs, items, containedGroups, TYPE });
}

createValidation.group = makeGroupValidationsFn(GROUPED);
createValidation.glue = makeGroupValidationsFn(GLUED);
createValidation.clone = (validation) =>
  clone({ validation, registry: CloneRegistry() });
createValidation.profile = createProfile;
