import getByPath from '../utils/get-by-path.js';
import setByPath from '../utils/set-by-path.js';
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
  path = '',
  initVal = undefined,
  onRestoredCBs = Functions(),
) {
  const ownOnRestoredCBs = Functions(onRestoredCBs);
  const values = new Map();
  const delim = '.';

  let ownObj;
  let ownPath;
  let ownInitVal;
  let isPath;
  let isInitVal;
  let savedValue;

  const init = (object = ownObj, pathName = ownPath, initValue = undefined) => {
    [ownObj, ownPath, ownInitVal, isPath, savedValue] = [
      object,
      pathName,
      initValue,
      pathName.includes(delim),
      initValue,
    ];
  };

  init(obj, path, initVal);

  return {
    setObject: init,
    getObject: () => ownObj,
    getPath: () => ownPath,
    getInitValue: () => ownInitVal,
    getValue: (key) =>
      key ? values.get(key) : getByPath(ownObj, ownPath, delim, isPath),
    saveValue: () => {
      savedValue = getByPath(ownObj, ownPath, delim, isPath);
    },
    restoreValue: (cbArgs) => {
      const isInitValue =
        isInitVal === undefined
          ? getByPath(ownObj, ownPath, delim, isPath) === ownInitVal
          : isInitVal;

      if (!isInitValue) {
        setByPath(ownObj, ownPath, savedValue, delim, isPath);
      } else {
        savedValue = ownInitVal;
      }
      ownOnRestoredCBs.run(cbArgs);
    },
    preserveValue(key = Symbol('ValidatableItem.value')) {
      const currValue = getByPath(ownObj, ownPath, delim, isPath);
      values.set(key, currValue);
      isInitVal = currValue === ownInitVal || currValue === undefined;
      return key;
    },
    clearValue(key) {
      isInitVal = undefined;
      return values.delete(key);
    },
    isInitValue() {
      return isInitVal;
    },
    clone: () => ValidatableItem(ownObj, ownPath, ownInitVal),
    onRestored: ownOnRestoredCBs.push,
    [Symbol.toStringTag]: ValidatableItem.name,
  };
}

export default ValidatableItem;
