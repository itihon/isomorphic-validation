// import memoize from '../utils/memoize.js';
import Functions from './functions.js';

// const ValidatedItem = memoize(createValidatedItem, () => [{}, '', '']);
const ValidatedItem = createValidatedItem;

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

function createValidatedItem(
  obj = {},
  propName = '',
  initVal = '',
  onRestoredCBs = Functions(),
) {
  let savedValue = initVal;
  let ownObj = obj;
  let ownPropName = propName;
  let ownInitVal = initVal;
  const ownOnRestoredCBs = Functions(onRestoredCBs);

  return {
    /*
              consider adding sanitizing functionality
              use case: Number.toFixed(), String().trim(),
              escape characters etc.
              UPD: this kind of feature may be implemented
              by adding the started event handler
          */
    setObject(
      object = ownObj,
      propertyName = ownPropName,
      initialValue = ownInitVal,
    ) {
      // forget previously memoized instance
      // ValidatedItem.forget(object, propertyName, initialValue); // in case an instance with the new parameters already exists
      // ValidatedItem.forget(ownObj, ownPropName, ownInitVal);
      // ValidatedItem.forget(ownObj, ownPropName, ownInitVal, ownOnRestoredCBs); // in case it was cloned

      ownObj = object;
      ownPropName = propertyName;
      ownInitVal = initialValue;

      // register the instance with the new parameters
      // ValidatedItem.remember(this, ownObj, ownPropName, ownInitVal);
    },
    getObject: () => ownObj,
    getValue: () => ownObj[ownPropName],
    saveValue: () => {
      savedValue = ownObj[ownPropName];
    },
    restoreValue: (cbArgs) => {
      if (ownObj[ownPropName] !== ownInitVal) {
        ownObj[ownPropName] = savedValue;
      } else {
        // obj[propName] = lastValid = initVal;
        savedValue = ownInitVal;
      }
      ownOnRestoredCBs.run(cbArgs);
    },
    // Since ValidatedItem is memoized, all clones of the same item are the same instance
    clone: () =>
      ValidatedItem(ownObj, ownPropName, ownInitVal, ownOnRestoredCBs),
    onRestored: ownOnRestoredCBs.push,
    [Symbol.toStringTag]: ValidatedItem.name,
  };
}

export default ValidatedItem;
