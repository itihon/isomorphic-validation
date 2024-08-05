import Functions from './functions.js';

ValidatableItem.keepValid = (
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

function ValidatableItem(
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
  let isInitVal = ownObj[ownPropName] === ownInitVal;

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
    getPropName: () => ownPropName,
    getInitValue: () => ownInitVal,
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
      const currValue = ownObj[ownPropName];
      values.set(key, currValue);
      isInitVal = currValue === initVal;
      return key;
    },
    clearValue(key) {
      isInitVal = undefined;
      return values.delete(key);
    },
    isInitValue() {
      return isInitVal;
    },
    clone: () =>
      ValidatableItem(ownObj, ownPropName, ownInitVal, ownOnRestoredCBs),
    onRestored: ownOnRestoredCBs.push,
    [Symbol.toStringTag]: ValidatableItem.name,
  };
}

export default ValidatableItem;
