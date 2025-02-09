import createApplyEffect from './create-apply-effect.js';

const setBackgroundEffect = (element, backgrounds, isValid) => {
  element.style.background = backgrounds[isValid].value;
};

const applyBackground = createApplyEffect(setBackgroundEffect, {
  true: { delay: 0, value: 'honeydew' },
  false: { delay: 0, value: 'lavenderblush' },
});

export default applyBackground;
