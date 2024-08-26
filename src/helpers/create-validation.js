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

/**
 * @typedef {import('../../intellisense/validation.jsdoc.js').Validation} Validation
 */

/**
 * Creates a validation.
 * @function Validation
 * @param {Object} obj - A validatable object to bind the validation to.
 * @param {string} propName - A property name or a path to the validatable value with dots as delimitters.
 * @param {*} initVal - An initial value of the validatable item.
 * @returns {Validation}
 */

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
