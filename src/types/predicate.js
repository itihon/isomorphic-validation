import acceptOnlyFunctionOrPredicate from '../helpers/accept-only-function-or-predicate.js';
import makeIsomorphicAPI from '../utils/make-isomorphic-api.js';
import ValidityCallbacks from './validity-callbacks.js';

export default function Predicate(fnOrPred) {
  acceptOnlyFunctionOrPredicate(fnOrPred);

  let validityCBs;

  const fn = ({ validityCBs } = fnOrPred.valueOf()).valueOf();

  validityCBs = ValidityCallbacks(validityCBs);

  const predicate = {
    valueOf() {
      return { validityCBs, valueOf: () => fn };
    },
    valid: validityCBs.valid,
    invalid: validityCBs.invalid,
    changed: validityCBs.changed,
    validated: validityCBs.validated,
    started: validityCBs.started,
    restored: validityCBs.restored,
    error: validityCBs.error,
    // !consider for adding: deferred (or delayed), canceled???
    [Symbol.toStringTag]: 'Predicate',
  };

  return makeIsomorphicAPI(predicate);
}
