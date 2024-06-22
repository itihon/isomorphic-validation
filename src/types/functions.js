import isFunction from '../utils/is-function.js';

export default function Functions(iterable = [][Symbol.iterator]()) {
  const obj = { ...iterable, length: 0 };
  const length = Object.keys(obj).length - 1;

  obj.length = length;

  const fns = Array.from(obj).filter(isFunction);

  function push(...args) {
    Array.prototype.push.call(fns, ...args.filter(isFunction));
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
