import createApplyEffect from './create-apply-effect.js';
import retrieveIfHasOrCreate, {
  newMap,
} from '../utils/retrieve-if-has-or-create.js';
import getOffset from '../utils/get-offset.js';

const positionElementRelativeTo = (
  orienteer,
  element,
  position = 'LEVEL_RIGHT_BESIDE',
  mode = 'MIN_SIDE',
) => {
  const { offsetWidth, offsetHeight } = orienteer;
  const { offsetLeft, offsetTop } = getOffset(orienteer);
  const elementWidth = mode === 'MIN_SIDE' ? offsetHeight : offsetWidth;
  const { style } = element;

  switch (mode) {
    case 'MIN_SIDE':
      element.style.width = `${offsetHeight}px`;
      element.style.height = `${offsetHeight}px`;
      break;

    case 'MAX_SIDE':
      element.style.width = `${offsetWidth}px`;
      element.style.height = ``;
      break;

    default:
      break;
  }

  switch (position) {
    case 'ABOVE_LEFT_BESIDE':
      style.left = `${offsetLeft - elementWidth}px`;
      style.top = `${offsetTop}px`;
      style.transform = `translateY(-100%)`;
      break;

    case 'ABOVE_LEFT':
      style.left = `${offsetLeft - elementWidth + offsetHeight}px`;
      style.top = `${offsetTop}px`;
      style.transform = `translateY(-100%)`;
      break;

    case 'ABOVE_CENTER':
      style.left = `${offsetLeft + offsetWidth / 2 - elementWidth / 2}px`;
      style.top = `${offsetTop}px`;
      style.transform = `translateY(-100%)`;
      break;

    case 'ABOVE_RIGHT':
      style.left = `${offsetLeft + offsetWidth - offsetHeight}px`;
      style.top = `${offsetTop}px`;
      style.transform = `translateY(-100%)`;
      break;

    case 'ABOVE_RIGHT_BESIDE':
      style.left = `${offsetLeft + offsetWidth}px`;
      style.top = `${offsetTop}px`;
      style.transform = `translateY(-100%)`;
      break;

    case 'LEVEL_LEFT_BESIDE':
      style.left = `${offsetLeft - elementWidth}px`;
      style.top = `${offsetTop + offsetHeight / 2}px`;
      style.transform = `translateY(-50%)`;
      break;

    case 'LEVEL_LEFT':
      style.left = `${offsetLeft - elementWidth + offsetHeight}px`;
      style.top = `${offsetTop + offsetHeight / 2}px`;
      style.transform = `translateY(-50%)`;
      break;

    case 'LEVEL_CENTER':
      style.left = `${offsetLeft + offsetWidth / 2 - elementWidth / 2}px`;
      style.top = `${offsetTop + offsetHeight / 2}px`;
      style.transform = `translateY(-50%)`;
      break;

    case 'LEVEL_RIGHT':
      style.left = `${offsetLeft + offsetWidth - offsetHeight}px`;
      style.top = `${offsetTop + offsetHeight / 2}px`;
      style.transform = `translateY(-50%)`;
      break;

    case 'LEVEL_RIGHT_BESIDE':
      style.left = `${offsetLeft + offsetWidth}px`;
      style.top = `${offsetTop + offsetHeight / 2}px`;
      style.transform = `translateY(-50%)`;
      break;

    case 'BELOW_LEFT_BESIDE':
      style.left = `${offsetLeft - elementWidth}px`;
      style.top = `${offsetTop + offsetHeight}px`;
      style.transform = ``;
      break;

    case 'BELOW_LEFT':
      style.left = `${offsetLeft - elementWidth + offsetHeight}px`;
      style.top = `${offsetTop + offsetHeight}px`;
      style.transform = ``;
      break;

    case 'BELOW_CENTER':
      style.left = `${offsetLeft + offsetWidth / 2 - elementWidth / 2}px`;
      style.top = `${offsetTop + offsetHeight}px`;
      style.transform = ``;
      break;

    case 'BELOW_RIGHT':
      style.left = `${offsetLeft + offsetWidth - offsetHeight}px`;
      style.top = `${offsetTop + offsetHeight}px`;
      style.transform = ``;
      break;

    case 'BELOW_RIGHT_BESIDE':
      style.left = `${offsetLeft + offsetWidth}px`;
      style.top = `${offsetTop + offsetHeight}px`;
      style.transform = ``;
      break;

    default:
      break;
  }
};

const createBox = (content) => {
  const box = document.createElement('div');
  box.innerHTML = content;
  return box;
};

const createContainer = (where, id) => {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';
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
    box = createBox(value(validationResult));
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

  const widthBefore = element.offsetParent.scrollWidth;

  if (box.hasChildNodes()) {
    Object.assign(box.style, stateValues.style);
    container.appendChild(box);
  }

  const widthAfter = element.offsetParent.scrollWidth;

  if (widthBefore !== widthAfter) {
    positionElementRelativeTo(
      element,
      container,
      stateValues.position,
      stateValues.mode,
    );
  }
};

const applyBox = createApplyEffect(setBoxEffect, {
  true: { delay: 0, value: '' },
  false: { delay: 0, value: '' },
  position: 'LEVEL_RIGHT_BESIDE',
  mode: 'MIN_SIDE',
});

export default applyBox;
