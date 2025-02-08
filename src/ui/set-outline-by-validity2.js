import setByValidity from './set-by-validity2.js';

const setOutlineEffect = (element, outlines, isValid) => {
  element.style.outline = outlines[isValid].value;
};

const setOutlineByValidity = setByValidity(setOutlineEffect, {
  true: { delay: 0, value: '1px solid green' },
  false: { delay: 0, value: '1px solid red' },
});

export default setOutlineByValidity;
