import getByPath from '../utils/get-by-path.js';
import setByPath from '../utils/set-by-path.js';

ValidatableItem.keepValid = (items = [], isValid = false) => {
  if (isValid === true) {
    items.forEach((item) => item.saveValue());
  } else {
    items.forEach((item) => item.restoreValue());
  }
  return !isValid;
};

function ValidatableItem(obj = {}, path = '', initVal = undefined) {
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
    restoreValue: () => {
      const isInitValue =
        isInitVal === undefined
          ? getByPath(ownObj, ownPath, delim, isPath) === ownInitVal
          : isInitVal;

      if (!isInitValue) {
        setByPath(ownObj, ownPath, savedValue, delim, isPath);
      } else {
        savedValue = ownInitVal;
      }
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
    [Symbol.toStringTag]: ValidatableItem.name,
  };
}

export default ValidatableItem;
