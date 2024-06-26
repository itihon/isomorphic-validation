import isFunction from '../utils/is-function.js';
import Functions from './functions.js';
import ValidityCallbacks from './validity-callbacks.js';

// ! refactor Predicate -> Validator
export default function Predicate(fnOrPred) {
  if (!isFunction(fnOrPred) && !(fnOrPred instanceof Predicate)) return null;

  let lastValidCBs;
  let validityCBs;

  const fn = ({ lastValidCBs, validityCBs } = fnOrPred.valueOf()).valueOf();

  lastValidCBs = Functions(lastValidCBs);
  validityCBs = ValidityCallbacks(false, validityCBs);

  const predicate = {
    valueOf() {
      return { fn, lastValidCBs, validityCBs, valueOf: () => fn };
    },
    valid: validityCBs.valid,
    invalid: validityCBs.invalid,
    changed: validityCBs.changed,
    validated: validityCBs.validated,
    keptValid: lastValidCBs.push,
    // !consider for adding: started, deferred (or delayed), canceled???
    [Symbol.toStringTag]: Predicate.name,
  };

  Reflect.setPrototypeOf(predicate, Predicate.prototype);

  return predicate;
}
// Predicate.defaultArg = (...args) => true;
// Predicate.defaultArg.valueOf = () => ({ valueOf: () => null });
