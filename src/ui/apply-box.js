import createApplyEffect from './create-apply-effect.js';
import retrieveIfHasOrCreate from '../utils/retrieve-if-has-or-create.js';

const positionElementRelativeTo = (
  orienteer,
  element,
  position = 'LEVEL_RIGHT_BESIDE',
  mode = 'MAX',
) => {
  const orienteerRect = orienteer.getBoundingClientRect();
  const elementSize = Math.min(orienteerRect.width, orienteerRect.height);

  let modX = 0;
  let modY = 0;

  switch (position) {
    case 'ABOVE_LEFT_BESIDE':
      modX = -elementSize;
      modY = -elementSize;
      break;

    case 'ABOVE_LEFT':
      modX = 0;
      modY = -elementSize;
      break;

    case 'ABOVE_CENTER':
      modX = orienteerRect.width / 2 - elementSize / 2;
      modY = -elementSize;
      break;

    case 'ABOVE_RIGHT':
      modX = orienteerRect.width - elementSize;
      modY = -elementSize;
      break;

    case 'ABOVE_RIGHT_BESIDE':
      modX = orienteerRect.width;
      modY = -elementSize;
      break;

    case 'LEVEL_LEFT_BESIDE':
      modX = -elementSize;
      modY = 0;
      break;

    case 'LEVEL_LEFT':
      modX = 0;
      modY = 0;
      break;

    case 'LEVEL_CENTER':
      modX = orienteerRect.width / 2 - elementSize / 2;
      modY = 0;
      break;

    case 'LEVEL_RIGHT':
      modX = orienteerRect.width - elementSize;
      modY = 0;
      break;

    case 'LEVEL_RIGHT_BESIDE':
      modX = orienteerRect.width;
      modY = 0;
      break;

    case 'BELOW_LEFT_BESIDE':
      modX = -elementSize;
      modY = elementSize;
      break;

    case 'BELOW_LEFT':
      modX = 0;
      modY = elementSize;
      break;

    case 'BELOW_CENTER':
      modX = orienteerRect.width / 2 - elementSize / 2;
      modY = elementSize;
      break;

    case 'BELOW_RIGHT':
      modX = orienteerRect.width - elementSize;
      modY = elementSize;
      break;

    case 'BELOW_RIGHT_BESIDE':
      modX = orienteerRect.width;
      modY = elementSize;
      break;

    default:
      break;
  }

  switch (mode) {
    case 'MIN':
      element.style.width = `${elementSize}px`;
      element.style.height = `${elementSize}px`;
      break;

    case 'MAX':
      element.style.width = `${orienteerRect.width}px`;
      break;

    default:
      break;
  }

  element.style.left = `${orienteerRect.left + modX + window.scrollX}px`;
  element.style.top = `${orienteerRect.top + modY + window.scrollY}px`;
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

const setBoxEffect = (element, stateValues, validationResult) => {
  const { isValid } = validationResult;
  const { parentNode } = element;
  const { id } = stateValues;
  let box;

  const container = retrieveIfHasOrCreate(
    containerRegistry,
    id,
    createContainer,
    parentNode,
    id,
  );

  const binaryBox = retrieveIfHasOrCreate(
    boxesRegistry,
    stateValues,
    () => new Map(),
  );

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

  if (box.hasChildNodes()) {
    Object.assign(box.style, stateValues.style);
    container.appendChild(box);
  }
};

const applyBox = createApplyEffect(setBoxEffect, {
  true: { delay: 0, value: '' },
  false: { delay: 0, value: '' },
  position: 'LEVEL_RIGHT_BESIDE',
  mode: 'MIN',
  id: 'apply_box_0',
});

export default applyBox;
