import acceptOnlyFunctionOrPredicate from '../helpers/accept-only-function-or-predicate.js';
import makeIsomorphicAPI from '../utils/make-isomorphic-api.js';
import StateCallbacks from './state-callbacks.js';

export default function Predicate(fnOrPred) {
  acceptOnlyFunctionOrPredicate(fnOrPred);

  let stateCBs;

  const fn = ({ stateCBs } = fnOrPred.valueOf()).valueOf();

  stateCBs = StateCallbacks(stateCBs);

  const predicate = {
    valueOf() {
      return { stateCBs, valueOf: () => fn };
    },
    valid: stateCBs.valid,
    invalid: stateCBs.invalid,
    changed: stateCBs.changed,
    validated: stateCBs.validated,
    started: stateCBs.started,
    restored: stateCBs.restored,
    error: stateCBs.error,
    // !consider for adding: deferred (or delayed), canceled???
    [Symbol.toStringTag]: 'Predicate',
  };

  return makeIsomorphicAPI(predicate);
}
