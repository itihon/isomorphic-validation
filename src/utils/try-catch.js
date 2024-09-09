export default function tryCatch(
  tryFn = Function.prototype,
  catchFn = Function.prototype, // catches error if enabled
  enableCatchFn = () => true, // enables catching errors
  catchFn2 = Function.prototype, // the second level of error catching in case catchFn or onCatchedCB is also faulty
  onCatchedCB = Function.prototype, // executes on error regardles of enabling catching, does not catch the error
  promisifySyncErrors = false,
) {
  let allowNext = false;
  let fallbackValue = null;

  function next() {
    // ignore catchFn2
    allowNext = true;
  }

  function catcher(err) {
    const res = catchFn(err, next);
    if (allowNext) throw err;
    return res;
  }

  function catcher2(err) {
    if (allowNext) {
      if (promisifySyncErrors) {
        return Promise.reject(err);
      }

      throw err;
    }
    fallbackValue = catchFn2(err);
    return fallbackValue;
  }

  function callback(err) {
    fallbackValue = onCatchedCB(err);
    return fallbackValue;
  }

  function tryCatchWrapper(...args) {
    allowNext = false;
    fallbackValue = null;

    try {
      const result = tryFn(...args);

      if (result.then) {
        result
          .catch(callback)
          .catch(catcher2)
          .catch(() => {}); // the last catch is because catcher2 forwards the error if next() was called in the catchFn

        if (enableCatchFn()) {
          return result
            .catch(catcher)
            .catch(catcher2)
            .then((res) => fallbackValue || res); // in case catchFn is also faulty
        }
      }

      return result;
    } catch (err) {
      try {
        callback(err);
      } catch (err2) {
        catcher2(err2);
      }

      if (enableCatchFn()) {
        try {
          catcher(err);
          return fallbackValue;
        } catch (err2) {
          // in case catchFn is also faulty
          return catcher2(err2);
        }
      }

      if (promisifySyncErrors) {
        return Promise.reject(err);
      }

      throw err;
    }
  }

  return Object.defineProperty(tryCatchWrapper, 'name', {
    value: `${tryFn.name}_TC`,
  });
}
