import acceptOnlyFunction from '../helpers/accept-only-function.js';

export default function Functions(iterable = [][Symbol.iterator]()) {
  const fns = [...iterable].map(acceptOnlyFunction);

  function push(...args) {
    Array.prototype.push.call(fns, ...args.map(acceptOnlyFunction));
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
