import ObserverAnd from './observer-and.js';
import StateCallbacks from './state-callbacks.js';
import ManyToManyMap from './many-to-many-map.js';
import ObservablePredicates from './observable-predicates.js';
import CloneRegistry from './clone-registry.js';
import {
  PredicateGroupsRepresentation,
  ValidationResult,
} from './representations.js';

export default function PredicateGroups(
  pgs = ManyToManyMap(),
  stateCBs = StateCallbacks(),
) {
  const obs = ObserverAnd();
  const representation = PredicateGroupsRepresentation(obs);
  const view = representation.toRepresentation();
  const validationResult = ValidationResult(view);

  stateCBs.setArg(validationResult);

  obs.onChanged(stateCBs.change);

  return Object.defineProperties(
    {
      add(key, predicateGroup = ObservablePredicates()) {
        obs.subscribe(predicateGroup);
        pgs.add(key, predicateGroup);
        representation.add(key, predicateGroup.toRepresentation());
        return this;
      },

      run(id, callID) {
        const predicateGroups = id !== undefined ? pgs.get(id) : pgs.getAll();

        return predicateGroups
          ? Promise.all(
              Array.from(predicateGroups, (predicateGroup) =>
                predicateGroup.run(undefined, callID),
              ),
            ).then((res) => !res.flat().some((value) => value !== true)) // ! slow
          : Promise.reject(
              new Error(
                `There are no predicates associated with the target ${JSON.stringify(
                  id,
                )}`,
              ),
            );
      },

      clone(registry = CloneRegistry()) {
        const newPgs = PredicateGroups(undefined, StateCallbacks(stateCBs));

        pgs
          .map((group) => registry.cloneOnce(group, registry))
          .forEach((group, key) => newPgs.add(key, group));

        return newPgs;
      },

      changeKey(oldKey, newKey) {
        pgs.changeKey(oldKey, newKey);
        representation.changeKey(oldKey, newKey);
        return this;
      },

      enableCatch() {
        return stateCBs.valueOf().errorCBs.length;
      },

      result(target) {
        validationResult.target = target;
        return validationResult;
      },

      toRepresentation: representation.toRepresentation,
      valid: stateCBs.valid,
      invalid: stateCBs.invalid,
      changed: stateCBs.changed,
      validated: stateCBs.validated,
      started: stateCBs.started,
      error: stateCBs.error,
      catchCBs: stateCBs.catch,
      startCBs: stateCBs.start,
      runCBs: stateCBs.set,
      map: pgs.map,
      forEach: pgs.forEach,
      mergeWith: pgs.mergeWith,
      getAll: pgs.getAll,
      has: pgs.has.bind(pgs),
      get: pgs.get.bind(pgs),
      [Symbol.toStringTag]: PredicateGroups.name,
    },
    {
      isValid: { get: obs.getValue },
    },
  );
}
