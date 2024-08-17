import { SINGLE, GLUED } from '../constants.js';
import Predicate from '../types/predicate.js';
import ManyToManyMap from '../types/many-to-many-map.js';
import ObservablePredicate from '../types/observable-predicate.js';

export default function addObservablePredicate(
  predicate = Predicate(),
  items = ManyToManyMap(),
  {
    TYPE = SINGLE,
    next = true,
    keepValid = false,
    optional = false,
    debounce = 0,
    anyData,
  } = {},
) {
  if (TYPE === GLUED) {
    const op = ObservablePredicate(
      predicate,
      [...items.getAll()],
      keepValid,
      optional,
      debounce,
      anyData,
    );

    return function forGlued(predicateGroup /* key */) {
      predicateGroup.add(op, { next });
    };
  }

  return function forSingleOrGrouped(predicateGroup, key) {
    predicateGroup.add(
      ObservablePredicate(
        Predicate(predicate),
        [...items.get(key)],
        keepValid,
        optional,
        debounce,
        anyData,
      ),
      { next },
    );
  };
}
