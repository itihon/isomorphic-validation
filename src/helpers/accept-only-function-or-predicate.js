import isFunction from '../utils/is-function.js';

export default function acceptOnlyFunctionOrPredicate(value) {
  if (!isFunction(value) && Object(value)[Symbol.toStringTag] !== 'Predicate') {
    throw new Error('Neither a function nor a Predicate was passed in.');
  }
  return value;
}
