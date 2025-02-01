import acceptOnlyFunction from '../helpers/accept-only-function.js';

export default function Functions(iterable = [][Symbol.iterator]()) {
  const fns = [...iterable].map(acceptOnlyFunction);

  function push(fnsToAdd = [], ...rest) {
    if (
      !Array.prototype.push.call(
        fns,
        ...[fnsToAdd].concat(rest).flat(Infinity).map(acceptOnlyFunction),
      )
    ) {
      const { warn } = console;
      warn('Expected functions to be passed in, received nothing.');
    }
    return this;
  }

  function run(...args) {
    return fns.map((fn) => fn(...args));
  }

  return Object.defineProperties(fns, {
    push: { value: push },
    run: { value: run },
    [Symbol.toStringTag]: { value: Functions.name },
  });
}
