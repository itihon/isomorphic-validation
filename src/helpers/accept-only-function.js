import isFunction from '../utils/is-function.js';

export default function acceptOnlyFunction(value) {
  if (!isFunction(value)) {
    throw new Error(`The passed in value is not a function: ${value}`);
  }

  return value;
}
