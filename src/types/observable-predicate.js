import Predicate from './predicate.js';
import ObserverAnd from './observer-and.js';
import indexedName from '../utils/indexed-name.js';
import ValidatableItem from './validatable-item.js';
import CloneRegistry from './clone-registry.js';
import Functions from './functions.js';
import acceptOnlyBoolean from '../helpers/accept-only-boolean.js';
import { IS_CLIENT } from '../utils/getenv.js';
import debounceP from '../utils/debounce-p.js';
import tryCatch from '../utils/try-catch.js';
import {
  ObservablePredicateRepresentation,
  ObservablePredicatesRepresentation,
  PredicateGroupsRepresentation,
  ValidationResult,
} from './representations.js';
import acceptOnlyPredicate from '../helpers/accept-only-predicate.js';
import makeRunStateCBsFn from '../helpers/make-run-state-cbs-fn.js';

export default function ObservablePredicate(
  predicate = Predicate(),
  items = [],
  keepValid = false,
  initState = false,
  debounce = 0,
  validatableItem = ValidatableItem(), // an item the predicate will be associated with, for setting validation result target
) {
  acceptOnlyPredicate(predicate);

  let stateCBs;
  let anyData;

  const fn = ({ stateCBs, anyData } = predicate.valueOf()).valueOf();
  const fnName = fn.name || indexedName('predicate');
  const obs = ObserverAnd(initState); // optional predicates are valid by default
  const onInvalidCBs = Functions();

  const notifySubscribers = obs.update;
  const runStateCBs = makeRunStateCBsFn(stateCBs);
  const setValidity = (value) => {
    if (!value) {
      onInvalidCBs.run();
    }
    return runStateCBs(value);
  };

  const representation = ObservablePredicateRepresentation(
    obs,
    predicate,
    fnName,
    anyData,
  );
  const groupRepresentation = ObservablePredicatesRepresentation(obs);
  const pgsRepresentation = PredicateGroupsRepresentation(obs);
  const validationResult = ValidationResult(
    pgsRepresentation.toRepresentation(),
  );

  groupRepresentation.push(representation);
  items.forEach((item) =>
    pgsRepresentation.add(item.getObject(), groupRepresentation),
  );

  Object.defineProperties(validationResult, {
    // getter, because the object can be changed through Validation().bind() method
    target: { get: validatableItem.getObject },
  });

  stateCBs.setArg(validationResult);

  const predicateFn = debounce && IS_CLIENT ? debounceP(fn, debounce) : fn;

  obs.onChanged(stateCBs.runChanged);

  function predicatePostExec(result, forbidInvalid, callID) {
    acceptOnlyBoolean(result);
    notifySubscribers(result);
    if (forbidInvalid) {
      if (ValidatableItem.keepValid(items, result)) {
        stateCBs.runRestored();

        items.forEach((item) => item.preserveValue(callID));
        return obsPredicate(!forbidInvalid, callID, true);
      }
    }
    return setValidity(result);
  }

  function obsPredicate(
    forbidInvalid = keepValid,
    callID = undefined,
    revalidate = false,
    skipOptional = false,
    invalidate = false, // invalidate if belongs to a non-optional group and the validatable value equals to the initial value
  ) {
    if (!revalidate) {
      stateCBs.runStarted();
    }

    if (skipOptional) {
      return predicatePostExec(true, forbidInvalid, callID);
    }

    if (invalidate) {
      return predicatePostExec(false, forbidInvalid, callID);
    }

    const result = predicateFn(...items.map((item) => item.getValue(callID)));

    if (result && result.then) {
      return result.then((res) =>
        predicatePostExec(res, forbidInvalid, callID),
      );
    }

    return predicatePostExec(result, forbidInvalid, callID);
  }

  const obsPredicateTC = tryCatch(
    obsPredicate,
    stateCBs.runError, // the catch function
    () => stateCBs.valueOf().errorCBs.length, // enable the catch function if error state callbacks were added
    () => false, // if the catch function is also faulty, return false and swallow the error
    () => obsPredicateTC.invalidate(), // invalidate on any error occurance
  );

  return Object.defineProperties(obsPredicateTC, {
    toRepresentation: { value: () => representation },
    invalidate: {
      value: () => {
        if (debounce) predicateFn.cancel(false);
        return setValidity(notifySubscribers(false));
      },
    },
    clone: {
      value: (registry = CloneRegistry()) =>
        ObservablePredicate(
          Predicate(predicate),
          items.map((item) => registry.cloneOnce(item)),
          keepValid,
          initState,
          debounce,
          registry.cloneOnce(validatableItem),
        ),
    },
    getID: { value: obs.getID },
    getValue: { value: obs.getValue },
    onChanged: { value: obs.onChanged },
    onInvalid: { value: onInvalidCBs.push },
    name: { value: `${fnName}_OP` },
    [Symbol.toStringTag]: { value: 'ObservablePredicate' },
  });
}
