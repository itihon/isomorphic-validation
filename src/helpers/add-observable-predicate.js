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
    debounce = 0,
    keepValid = false,
    optional = false,
    anyData,
  } = {},
) {
  if (TYPE === GLUED) {
    const op = ObservablePredicate(
      predicate,
      [...items.getAll()],
      keepValid,
      optional,
      anyData,
    );

    return function forGlued(predicateGroup /* key */) {
      predicateGroup.add(op, { next, debounce });
    };
  }

  return function forSingleOrGrouped(predicateGroup, key) {
    predicateGroup.add(
      ObservablePredicate(
        Predicate(predicate),
        [...items.get(key)],
        keepValid,
        optional,
        anyData,
      ),
      { next, debounce },
    );
  };
}
