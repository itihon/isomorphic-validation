import ObserverAnd from './observer-and.js';
import ValidityCallbacks from './validity-callbacks.js';
import ManyToManyMap from './many-to-many-map.js';
import ObservablePredicates from './observable-predicates.js';
import ConsoleRepresentation from './console-representation.js';
import indexedName from '../utils/indexed-name.js';

export default function PredicateGroups(
  pgs = ManyToManyMap(),
  validityCBs = ValidityCallbacks(),
) {
  const obs = ObserverAnd();
  const representation = ConsoleRepresentation(
    'ValidationResult',
    ManyToManyMap(),
    {
      isValid: { get: obs.getValue },
      target: { writable: true },
      toJSON: {
        value() {
          return [...this].reduce(
            (acc, [key, set]) => {
              acc[key.name || indexedName('obj')] = [...set];
              return acc;
            },
            {
              name: this[Symbol.toStringTag],
              isValid: obs.getValue(),
            },
          );
        }, // without bind jest throwed an error (in expect().toStrictEqual())
      },
    },
  );

  const addRepresentation = representation.add;
  delete representation.add;
  delete representation.forEach;
  delete representation.getAll;
  delete representation.map;
  delete representation.mergeWith;

  return Object.defineProperties(
    {
      add(key, predicateGroup = ObservablePredicates()) {
        obs.subscribe(predicateGroup);
        pgs.add(key, predicateGroup);
        // representation.add(keys, predicateGroup.toRepresentation());
        addRepresentation(key, predicateGroup.toRepresentation());
        return this;
      },
      run(id) {
        // ! fire the started event
        // !!! duplicate of logic
        const predicateGroups = id !== undefined ? pgs.get(id) : pgs.getAll();

        return predicateGroups
          ? Promise.all(
              Array.from(predicateGroups, (predicateGroup) =>
                predicateGroup.run(id),
              ),
            )
          : Promise.reject(
              new Error(
                'There are no predicates assosiatied with the passed id:',
              ),
            );
      },
      clone() {
        const newPgs = PredicateGroups(
          undefined,
          ValidityCallbacks(false, validityCBs),
        );

        const cloneRegistry = new Map(); // for cloning glued predicates

        pgs
          .map((predicateGroup) => predicateGroup.clone(cloneRegistry))
          .forEach((group, key) => newPgs.add(key, group));

        return newPgs;
      },
      toRepresentation(id) {
        representation.target = id;
        return representation;
      },
      onChanged: obs.onChanged,
      valid: validityCBs.valid,
      invalid: validityCBs.invalid,
      changed: validityCBs.changed,
      validated: validityCBs.validated,
      // !consider for adding: started
      runCBs: validityCBs.set,
      map: pgs.map,
      forEach: pgs.forEach,
      mergeWith: pgs.mergeWith,
      has: pgs.has.bind(pgs),
      get: pgs.get.bind(pgs),
      [Symbol.toStringTag]: PredicateGroups.name,
    },
    {
      isValid: { get: obs.getValue },
    },
  );
}
