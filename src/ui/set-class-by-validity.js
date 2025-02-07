import setByValidity from './set-by-validity';

const setClassEffect = (element, classNames, isValid) => {
  const classNameToRemove = classNames[!isValid];
  const classNameToAdd = classNames[isValid];

  if (classNameToRemove) element.classList.remove(classNameToRemove);
  if (classNameToAdd) element.classList.add(classNameToAdd);
};

const setClassByValidity = setByValidity(setClassEffect, {
  true: 'valid',
  false: 'invalid',
});

export default setClassByValidity;
