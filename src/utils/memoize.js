export default function memoize(fn) {
  const argsIdxs = new Map();
  const resIdxs = new Map();
  const counter = () => argsIdxs.size;
  const retrieveIfHas =
    (map = new Map()) =>
    (value = Function.prototype, ...args) =>
    (key) =>
      map.has(key) ? map.get(key) : map.set(key, value(...args)).get(key);

  return function memoized(...args) {
    return retrieveIfHas(resIdxs)(fn, ...args)(
      args.map(retrieveIfHas(argsIdxs)(counter)).join(','),
    );
  };
}
