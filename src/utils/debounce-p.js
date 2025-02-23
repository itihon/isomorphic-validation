// !consider for adding firing canceled??? and deferred (or delayed) events
export default function debounceP(fn = Function.prototype, delay = 0) {
  let timeout;
  let promise;
  let resolveFn = () => {};
  let rejectFn = () => {};

  const suffix = '_DP';
  const debouncedFnName = fn.name + suffix;

  const resolvers = new Map();
  const rejecters = new Map();

  const resolve = (res) => {
    resolveFn(res);
    promise = null;
  };

  const reject = (err) => {
    rejectFn(err);
    promise = null;
  };

  const emptyFn = () => {
    promise = null;
  };

  const deferredFn = (id, ...args) => {
    try {
      const result = fn(...args);

      if (result.then) {
        result.then(
          (res) => (resolvers.get(id) || emptyFn)(res),
          (err) => (rejecters.get(id) || emptyFn)(err),
        );
      } else {
        resolve(result);
      }
    } catch (err) {
      reject(err);
    }
  };

  const debouncedFn = {
    [debouncedFnName]: (...args) => {
      resolvers.clear();
      rejecters.clear();
      clearTimeout(timeout);

      const id = Symbol('debouncedFn.callID');
      timeout = setTimeout(deferredFn, delay, id, ...args);
      resolvers.set(id, resolve);
      rejecters.set(id, reject);

      if (!promise) {
        promise = new Promise((res, rej) => {
          resolveFn = res;
          rejectFn = rej;
        });
      }

      return promise;
    },
  }[debouncedFnName];

  debouncedFn.cancel = (retVal) => {
    clearTimeout(timeout);
    resolve(retVal);
    promise = null;
  };

  debouncedFn.valueOf = () => ({ fn, delay, valueOf: () => fn });

  return debouncedFn;
}
