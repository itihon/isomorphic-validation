import createApplyEffect from './create-apply-effect';

const setClassEffect = (element, classNames, { isValid }) => {
  const classNameToRemove = classNames[!isValid].value;
  const classNameToAdd = classNames[isValid].value;

  if (classNameToRemove) element.classList.remove(classNameToRemove);
  if (classNameToAdd) element.classList.add(classNameToAdd);
};

const applyClass = createApplyEffect(setClassEffect, {
  true: { delay: 0, value: 'valid' },
  false: { delay: 0, value: 'invalid' },
});

export default applyClass;
