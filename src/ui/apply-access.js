import createApplyEffect from './create-apply-effect.js';

const supportedTags = new Set([
  'button',
  'fieldset',
  'optgroup',
  'option',
  'select',
  'textarea',
  'input',
]);

const setAccessEffect = (element, accesses, isValid) => {
  if (!supportedTags.has(element.localName)) {
    const { warn } = console;
    warn(
      `The element ${element.localName} doesn't support the 'disabled' attribute.`,
    );
  }
  element.disabled = accesses[isValid].value;
};

const applyAccess = createApplyEffect(setAccessEffect, {
  true: { delay: 0, value: false },
  false: { delay: 0, value: true },
});

export default applyAccess;
