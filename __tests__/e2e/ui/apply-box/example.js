import { applyBox, toEventHandler } from '../../../../src/index.ui.js';

const options = document.querySelector('.options');
const { input1 } = document.form;
const boxEID = 'CONTENT_BOX';

const style = {
  backgroundColor: 'rgba(255, 255, 255, .7)',
  display: 'grid',
  gridTemplateColumns: 'auto auto',
  boxShadow:
    'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px',
};

const content = {
  MIN_SIDE: '✅',
  MAX_SIDE: `
        <span style="text-align: center">ⅈ</span>
        <span style="margin: auto 0"> First line</span>
        <span style="text-align: center">ⓘ</span>
        <span style="margin: auto 0"> Second line</span>
    `,
};

const changeBox = () => {
  const [{ innerText: mode } = {}, { innerText: position } = {}] =
    options.querySelectorAll('input:checked + label');

  const contentBox = { false: { value: content[mode] }, mode, position, style };
  const [, setBox] = applyBox(contentBox, input1, boxEID);

  toEventHandler(setBox)({});
};
options.addEventListener('change', changeBox);
changeBox();
// window.addEventListener('loadeddata', changeBox);
