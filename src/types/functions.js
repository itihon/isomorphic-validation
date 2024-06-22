import isFunction from '../utils/is-function.js';

export default function Functions(iterable = [][Symbol.iterator]()) {
  const fns = [...iterable].filter(isFunction);

  function push(...args) {
    Array.prototype.push.call(fns, ...args.filter(isFunction));
    return this;
  }

  // !Object assign takes less lines of code.
  // rewrite as in ManyToManyMap
  return Object.defineProperties(fns, {
    push: {
      value: push,
    },
    run: {
      value(...args) {
        return fns.map((fn) => fn(...args));
      },
    },
    [Symbol.toStringTag]: {
      value: Functions.name,
    },
  });
}
