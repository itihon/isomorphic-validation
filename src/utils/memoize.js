export default function memoize(fn = Function.prototype, defaultParams = []) {
  const argsIdxs = new Map();
  const resIdxs = new Map();
  const counter = () => argsIdxs.size;
  const retrieveIfHas =
    (map = new Map()) =>
    (value = Function.prototype, ...args) =>
    (key) =>
      map.has(key) ? map.get(key) : map.set(key, value(...args)).get(key);

  return function memoized(...args) {
    const params = [];
    const length = Math.max(args.length, defaultParams.length);

    for (let i = 0; i < length; i++) {
      params[i] = args[i] !== undefined ? args[i] : defaultParams[i];
    }

    return retrieveIfHas(resIdxs)(fn, ...params)(
      params.map(retrieveIfHas(argsIdxs)(counter)).join(','),
    );
  };
}
