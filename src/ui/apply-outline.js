import createApplyEffect from './create-apply-effect.js';

const setOutlineEffect = (element, outlines, isValid) => {
  element.style.outline = outlines[isValid].value;
};

const applyOutline = createApplyEffect(setOutlineEffect, {
  true: { delay: 0, value: '1px solid green' },
  false: { delay: 0, value: '1px solid red' },
});

export default applyOutline;
