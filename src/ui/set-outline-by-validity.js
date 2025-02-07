import setByValidity from './set-by-validity';

const setOutlineEffect = (element, outlines, isValid) => {
  element.style.outline = outlines[isValid];
};

const setOutlineByValidity = setByValidity(setOutlineEffect, {
  true: '1px solid green',
  false: '1px solid red',
});

export default setOutlineByValidity;
