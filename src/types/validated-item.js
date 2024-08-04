import Functions from './functions.js';

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

function ValidatedItem(
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
  const values = new Map();

  return {
    setObject(
      object = ownObj,
      propertyName = ownPropName,
      initialValue = ownInitVal,
    ) {
      ownObj = object;
      ownPropName = propertyName;
      ownInitVal = initialValue;
    },
    getObject: () => ownObj,
    getValue: (key) => (key ? values.get(key) : ownObj[ownPropName]),
    saveValue: () => {
      savedValue = ownObj[ownPropName];
    },
    restoreValue: (cbArgs) => {
      if (ownObj[ownPropName] !== ownInitVal) {
        ownObj[ownPropName] = savedValue;
      } else {
        savedValue = ownInitVal;
      }
      ownOnRestoredCBs.run(cbArgs);
    },
    preserveValue(key = Symbol('ValidatableItem.value')) {
      values.set(key, ownObj[ownPropName]);
      return key;
    },
    clearValue(key) {
      return values.delete(key);
    },
    clone: () =>
      ValidatedItem(ownObj, ownPropName, ownInitVal, ownOnRestoredCBs),
    onRestored: ownOnRestoredCBs.push,
    [Symbol.toStringTag]: ValidatedItem.name,
  };
}

export default ValidatedItem;
