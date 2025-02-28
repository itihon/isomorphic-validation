import ObserverAnd from './observer-and.js';
import StateCallbacks from './state-callbacks.js';
import ManyToManyMap from './many-to-many-map.js';
import ObservablePredicates from './observable-predicates.js';
import CloneRegistry from './clone-registry.js';
import {
  PredicateGroupsRepresentation,
  ValidationResult,
} from './representations.js';
import makeRunStateCBsFn from '../helpers/make-run-state-cbs-fn.js';
import { SINGLE } from '../constants.js';

export default function PredicateGroups(
  pgs = ManyToManyMap(),
  stateCBs = StateCallbacks(),
  TYPE = SINGLE,
) {
  const obs = ObserverAnd();
  const representation = PredicateGroupsRepresentation(obs);
  const view = representation.toRepresentation();
  const validationResult = ValidationResult(view);

  if (TYPE === SINGLE) {
    Object.defineProperties(validationResult, {
      // getter, because the object can be changed through Validation().bind() method
      target: { get: () => pgs.keys().next().value },
    });
  }

  stateCBs.setArg(validationResult);

  obs.onChanged(stateCBs.runChanged);

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

        return Promise.all(
          Array.from(predicateGroups, (predicateGroup) =>
            predicateGroup.run(undefined, callID),
          ),
        ).then((res) => !res.flat().some((value) => value !== true)); // ! probably slow
      },

      clone(registry = CloneRegistry()) {
        const newPgs = PredicateGroups(
          undefined,
          StateCallbacks(stateCBs),
          TYPE,
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
        return stateCBs.valueOf().errorCBs.length;
      },

      result() {
        return validationResult;
      },

      setGroupTarget(target) {
        validationResult.target = target;
      },

      toRepresentation: representation.toRepresentation,
      valid: stateCBs.valid,
      invalid: stateCBs.invalid,
      changed: stateCBs.changed,
      validated: stateCBs.validated,
      started: stateCBs.started,
      error: stateCBs.error,
      catchCBs: stateCBs.runError,
      startCBs: stateCBs.runStarted,
      runCBs: makeRunStateCBsFn(stateCBs),
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
