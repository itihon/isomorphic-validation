import isFunction from '../utils/is-function.js';
import makeIsomorphicAPI from '../utils/make-isomorphic-api.js';
import Functions from './functions.js';
import ValidityCallbacks from './validity-callbacks.js';

/**
 * @typedef {import('../../intellisense/predicate.jsdoc.js').default} Predicate
 * @typedef {import('../../intellisense/shared.jsdoc.js').predicateFn} predicateFn
 */

/**
 * Creates a predicate object.
 * @overload
 * @param {predicateFn} predicateFn - A predicate function to be wrapped.
 * @returns {Predicate}
 */

/**
 * Creates a predicate object.
 * @overload
 * @param {Predicate} predicate - A predicate object to be cloned.
 * @returns {Predicate}
 */

export default function Predicate(fnOrPred) {
  if (!isFunction(fnOrPred) && !(fnOrPred instanceof Predicate)) return null;

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
    // !consider for adding: deferred (or delayed), canceled???
    [Symbol.toStringTag]: Predicate.name,
  };

  Reflect.setPrototypeOf(predicate, Predicate.prototype);

  return makeIsomorphicAPI(predicate);
}
