import isFunction from '../utils/is-function.js';
import Functions from './functions.js';
import ValidityCallbacks from './validity-callbacks.js';

// ! refactor Predicate -> Validator
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
    restored: restoredCBs.push,
    // !consider for adding: started, deferred (or delayed), canceled???
    [Symbol.toStringTag]: Predicate.name,
  };

  Reflect.setPrototypeOf(predicate, Predicate.prototype);

  return predicate;
}
// Predicate.defaultArg = (...args) => true;
// Predicate.defaultArg.valueOf = () => ({ valueOf: () => null });
