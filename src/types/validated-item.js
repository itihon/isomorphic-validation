import memoize from '../utils/memoize.js';
import Functions from './functions.js';

const ValidatedItem = memoize(function ValidatedItem(
  obj = {},
  propName = '',
  initVal = '',
) {
  const onRestoredCBs = Functions();
  let savedValue = initVal;

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
    saveValue: () => {
      savedValue = obj[propName];
    },
    restoreValue: (cbArgs) => {
      if (obj[propName] !== initVal) {
        obj[propName] = savedValue;
      } else {
        // obj[propName] = lastValid = initVal;
        savedValue = initVal;
      }
      onRestoredCBs.run(cbArgs);
    },
    onRestored: onRestoredCBs.push,
    [Symbol.toStringTag]: ValidatedItem.name,
  };
});

ValidatedItem.keepValid = (
  items = [],
  validationResult = { isValid: false },
) => {
  const { isValid } = validationResult;
  if (isValid === true) {
    items.forEach((item) => item.saveValue());
  } else {
    items.forEach((item) => item.restoreValue(validationResult));
  }
  return !isValid;
};

export default ValidatedItem;
