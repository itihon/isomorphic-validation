import createApplyEffect from './create-apply-effect';

const setOutlineEffect = (element, outlines, isValid) => {
  element.style.outline = outlines[isValid];
};

const applyOutline = createApplyEffect(setOutlineEffect, {
  true: '1px solid green',
  false: '1px solid red',
});

export default applyOutline;
