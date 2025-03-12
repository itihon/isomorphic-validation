import { SINGLE, GLUED } from '../constants.js';
import Predicate from '../types/predicate.js';
import ManyToManyMap from '../types/many-to-many-map.js';
import ObservablePredicate from '../types/observable-predicate.js';

export default function addObservablePredicate(
  predicate = Predicate(),
  items = ManyToManyMap(),
  { TYPE = SINGLE, next = true, debounce = 0, keepValid = false, groups } = {},
) {
  if (TYPE === GLUED) {
    // create ObservablePredicate the amount of groups number
    const gluedOPs = [...groups].map((predicateGroup) =>
      ObservablePredicate(
        Predicate(predicate),
        [...items.getAll()],
        keepValid,
        predicateGroup.isOptional(), // init state for an optional predicate
        debounce,
        predicateGroup.getItem(), // A validatable item the predicate group associated with (used as "target" in ObservablePredicate -> ValidationResult)
      ),
    );

    let i = 0;

    return function forGlued(predicateGroup /* key */) {
      predicateGroup.add(
        gluedOPs[i],
        { next },
        gluedOPs.filter((_, idx) => idx !== i),
      );
      if (groups.size === ++i) {
        i = 0;
      }
    };
  }

  return function forSingleOrGrouped(predicateGroup, key) {
    predicateGroup.add(
      ObservablePredicate(
        Predicate(predicate),
        [...items.get(key)],
        keepValid,
        predicateGroup.isOptional(), // init state for an optional predicate
        debounce,
        predicateGroup.getItem(), // A validatable item the predicate group associated with (used as "target" in ObservablePredicate -> ValidationResult)
      ),
      { next },
    );
  };
}
