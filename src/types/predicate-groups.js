import ObserverAnd from './observer-and.js';
import ValidityCallbacks from './validity-callbacks.js';
import ManyToManyMap from './many-to-many-map.js';
import ObservablePredicates from './observable-predicates.js';
import CloneRegistry from './clone-registry.js';
import {
  PredicateGroupsRepresentation,
  ValidationResult,
} from './representations.js';

export default function PredicateGroups(
  pgs = ManyToManyMap(),
  validityCBs = ValidityCallbacks(),
) {
  const obs = ObserverAnd();
  const representation = PredicateGroupsRepresentation(obs);
  const view = representation.toRepresentation();
  const validationResult = ValidationResult(view);

  obs.onChanged((result) => validityCBs.change(result, validationResult));

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
        const newPgs = PredicateGroups(
          undefined,
          ValidityCallbacks(false, validityCBs),
        );

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
        return validityCBs.valueOf().errorCBs.length;
      },

      result(target) {
        validationResult.target = target;
        return validationResult;
      },

      toRepresentation: representation.toRepresentation,
      valid: validityCBs.valid,
      invalid: validityCBs.invalid,
      changed: validityCBs.changed,
      validated: validityCBs.validated,
      started: validityCBs.started,
      error: validityCBs.error,
      catchCBs: validityCBs.catch,
      startCBs: validityCBs.start,
      runCBs: validityCBs.set,
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
