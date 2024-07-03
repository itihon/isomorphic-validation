import memoize from '../utils/memoize.js';
import ConsoleRepresentation from './console-representation.js';
import Functions from './functions.js';

const ValidatedItem = memoize(function ValidatedItem(
  obj = {},
  propName = '',
  initVal = '',
) {
  const onRestoredCBs = Functions();
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
    saveValue: () => {
      lastValid = obj[propName];
    },
    restoreValue: (cbArgs) => {
      if (obj[propName] !== initVal) {
        obj[propName] = lastValid;
      } else {
        // obj[propName] = lastValid = initVal;
        lastValid = initVal;
      }
      onRestoredCBs.run(cbArgs);
    },
    onRestored: onRestoredCBs.push,
    [Symbol.toStringTag]: ValidatedItem.name,
  };
});

ValidatedItem.keepValid = (
  items = [],
  validationResult = ConsoleRepresentation(),
) => {
  const {isValid} = validationResult;
  if (isValid) {
    items.forEach((item) => item.saveValue());
  } else {
    items.forEach((item) => item.restoreValue(validationResult));
  }
  return !isValid;
};

export default ValidatedItem;
