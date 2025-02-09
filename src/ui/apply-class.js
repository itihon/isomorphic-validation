import createApplyEffect from './create-apply-effect';

const setClassEffect = (element, classNames, isValid) => {
  const classNameToRemove = classNames[!isValid];
  const classNameToAdd = classNames[isValid];

  if (classNameToRemove) element.classList.remove(classNameToRemove);
  if (classNameToAdd) element.classList.add(classNameToAdd);
};

const applyClass = createApplyEffect(setClassEffect, {
  true: 'valid',
  false: 'invalid',
});

export default applyClass;
