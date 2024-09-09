// !consider for adding firing canceled??? and deferred (or delayed) events
export default function debounceP(fn = Function.prototype, delay = 0) {
  let timeout;
  let promise;
  let resolve = () => {};
  let reject = () => {};
  const suffix = '_DP';
  const debouncedFnName = fn.name + suffix;

  const deferredFn = (...args) => {
    try {
      resolve(fn(...args));
    } catch (err) {
      reject(err);
    }
    promise = null;
  };

  const debouncedFn = {
    [debouncedFnName]: (...args) => {
      clearTimeout(timeout);

      timeout = setTimeout(deferredFn, delay, ...args);

      if (!promise) {
        promise = new Promise((res, rej) => {
          resolve = res;
          reject = rej;
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
