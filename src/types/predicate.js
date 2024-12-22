import acceptOnlyFunctionOrPredicate from '../helpers/accept-only-function-or-predicate.js';
import makeIsomorphicAPI from '../utils/make-isomorphic-api.js';
import Functions from './functions.js';
import ValidityCallbacks from './validity-callbacks.js';

export default function Predicate(fnOrPred) {
  acceptOnlyFunctionOrPredicate(fnOrPred);

  let restoredCBs;
  let validityCBs;

  const fn = ({ restoredCBs, validityCBs } = fnOrPred.valueOf()).valueOf();

  restoredCBs = Functions(restoredCBs);
  validityCBs = ValidityCallbacks(false, validityCBs);

  const predicate = {
    valueOf() {
      return { restoredCBs, validityCBs, valueOf: () => fn };
    },
    valid: validityCBs.valid,
    invalid: validityCBs.invalid,
    changed: validityCBs.changed,
    validated: validityCBs.validated,
    started: validityCBs.started,
    restored: restoredCBs.push,
    error: validityCBs.error,
    // !consider for adding: deferred (or delayed), canceled???
    [Symbol.toStringTag]: Predicate.name,
  };

  return makeIsomorphicAPI(predicate);
}
