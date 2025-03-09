import createApplyEffect from './create-apply-effect.js';
import retrieveIfHasOrCreate, {
  newMap,
} from '../utils/retrieve-if-has-or-create.js';

const calcTop =
  (offsetHeightMult = 0) =>
  (offsetTop = 0, offsetHeight = 0) =>
    `${offsetTop + offsetHeight * offsetHeightMult}px`;

const calcLeft =
  (ewMult = 0, owMult = 0, ohMult = 0) =>
  (offsetLeft = 0, elementWidth = 0, offsetWidth = 0, offsetHeight = 0) =>
    `${offsetLeft + offsetWidth * owMult + elementWidth * ewMult + offsetHeight * ohMult}px`;

const positions = {
  ABOVE: { top: calcTop(0), transform: () => `translateY(-100%)` },
  LEVEL: { top: calcTop(0.5), transform: () => `translateY(-50%)` },
  BELOW: { top: calcTop(1), transform: () => `` },
  LEFT_BESIDE: { left: calcLeft(-1) },
  LEFT: { left: calcLeft(-1, 0, 1) },
  CENTER: { left: calcLeft(-0.5, 0.5) },
  RIGHT: { left: calcLeft(0, 1, -1) },
  RIGHT_BESIDE: { left: calcLeft(0, 1) },
};

const positionElementRelativeTo = (
  orienteer,
  element,
  position = 'LEVEL_RIGHT_BESIDE',
  mode = 'MIN_SIDE',
) => {
  const { style } = element;
  const { offsetWidth, offsetHeight } = orienteer;

  // reset element's coordinates in order to get the starting point of the element's relative coordinate system
  style.left = 0;
  style.top = 0;

  const offsetLeft = orienteer.offsetLeft - element.offsetLeft;
  const offsetTop = orienteer.offsetTop - element.offsetTop;
  const elementWidth = mode === 'MIN_SIDE' ? offsetHeight : offsetWidth;
  const [VERT, ...HOR] = position.split('_', 3);

  style.left = positions[HOR.join('_')].left(
    offsetLeft,
    elementWidth,
    offsetWidth,
    offsetHeight,
  );

  style.top = positions[VERT].top(offsetTop, offsetHeight);
};

const createBox = (content) => {
  const box = document.createElement('div');
  box.innerHTML = content;
  return box;
};

const createContainer = (where, id) => {
  const container = document.createElement('div');
  const { style } = container;

  style.position = 'relative';
  style.width = '0';
  style.height = '0';

  container.id = id;
  where.appendChild(container);

  return container;
};

const containerRegistry = new Map();
const boxesRegistry = new Map();

const setBoxEffect = (element, stateValues, validationResult, id) => {
  if (!element.offsetParent) {
    return;
  }

  const { isValid } = validationResult;
  const { parentNode } = element;
  let box;
  const boxStyle = { position: 'relative', width: '', height: '' };

  const container = retrieveIfHasOrCreate(
    containerRegistry,
    id,
    createContainer,
    parentNode,
    id,
  );

  const binaryBox = retrieveIfHasOrCreate(boxesRegistry, stateValues, newMap);

  const { value } = stateValues[isValid];

  if (container.parentNode !== parentNode) {
    parentNode.appendChild(container);
  }

  if (typeof value === 'function') {
    box = retrieveIfHasOrCreate(binaryBox, isValid, createBox, '');
    box.innerHTML = value(validationResult);
  } else {
    box = retrieveIfHasOrCreate(binaryBox, isValid, createBox, value);
  }

  while (container.hasChildNodes()) {
    container.lastElementChild.remove();
  }

  positionElementRelativeTo(
    element,
    container,
    stateValues.position,
    stateValues.mode,
  );

  if (box.hasChildNodes()) {
    const { offsetWidth, offsetHeight } = element;

    switch (stateValues.mode) {
      case 'MIN_SIDE':
        boxStyle.width = `${offsetHeight}px`;
        boxStyle.height = `${offsetHeight}px`;
        break;

      case 'MAX_SIDE':
        boxStyle.width = `${offsetWidth}px`;
        boxStyle.height = ``;
        break;

      default:
        break;
    }

    const [VERT] = stateValues.position.split('_', 1);
    boxStyle.transform = positions[VERT].transform();

    Object.assign(box.style, boxStyle, stateValues.style);
    container.appendChild(box);
  }
};

const applyBox = createApplyEffect(setBoxEffect, {
  true: { delay: 0, value: '' },
  false: { delay: 0, value: '' },
  position: 'LEVEL_RIGHT_BESIDE',
  mode: 'MIN_SIDE',
});

export default applyBox;
