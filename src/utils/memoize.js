export default function memoize(
  fn = Function.prototype,
  defaults = () => [],
  limit = Infinity,
) {
  const argsIdxs = new Map();
  const resIdxs = new Map();
  const counter = () => argsIdxs.size;
  const retrieveIfHas =
    (map = new Map()) =>
    (value = Function.prototype, ...args) =>
    (key) =>
      map.has(key) ? map.get(key) : map.set(key, value(...args)).get(key);

  const mergeWithDefaults = (args) => {
    const params = [];
    const defaultParams = defaults();
    const length = Math.max(args.length, defaultParams.length);

    for (let i = 0; i < length; i++) {
      params[i] = args[i] !== undefined ? args[i] : defaultParams[i];
    }

    return params;
  };

  const remember =
    (Fn) =>
    (...args) => {
      const params = mergeWithDefaults(args);
      return retrieveIfHas(resIdxs)(Fn, ...params)(
        params.map(retrieveIfHas(argsIdxs)(counter)).slice(0, limit).join(','),
      );
    };

  const memoized = remember(fn);

  memoized.remember = (res, ...args) => remember(() => res)(...args);

  memoized.forget = (...args) =>
    resIdxs.delete(
      mergeWithDefaults(args)
        .map((arg) => argsIdxs.get(arg))
        .join(','),
    );

  return memoized;
}
