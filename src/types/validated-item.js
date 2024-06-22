import memoize from '../utils/memoize.js';
import Functions from './functions.js';

export default memoize(function ValidatedItem(
  obj = {},
  propName = '',
  initVal = '',
) {
  const onLastValidCBs = Functions();
  let lastValid = initVal;

  return {
    /*
                consider adding sanitizing functionality
                use case: Number.toFixed(), String().trim(),
                escape characters etc.
                UPD: this kind of feature may be implemented
                by adding the started event handler
            */
    getObj: () => obj,
    getValue: () => obj[propName],
    saveLastValid: () => {
      lastValid = obj[propName];
    },
    retrieveLastValid: (cbArgs) => {
      if (obj[propName] !== initVal) {
        obj[propName] = lastValid;
      } else {
        // obj[propName] = lastValid = initVal;
        lastValid = initVal;
      }
      onLastValidCBs.run(cbArgs);
    },
    onLastValid: onLastValidCBs.push,
    [Symbol.toStringTag]: ValidatedItem.name,
  };
});
