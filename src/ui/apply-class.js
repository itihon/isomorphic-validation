import createApplyEffect from './create-apply-effect';

const classRegistry = new Map();

const setClassEffect = (element, classNames, { isValid }, effectID) => {
  const classNameToRemove = classRegistry.get(effectID);
  const classNameToAdd = classNames[isValid].value;

  if (classNameToRemove) element.classList.remove(classNameToRemove);
  if (classNameToAdd) {
    element.classList.add(classNameToAdd);
    classRegistry.set(effectID, classNameToAdd);
  }
};

const applyClass = createApplyEffect(setClassEffect, {
  true: { delay: 0, value: 'valid' },
  false: { delay: 0, value: 'invalid' },
});

export default applyClass;
