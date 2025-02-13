import createApplyEffect from './create-apply-effect.js';
import retrieveIfHasOrCreate from '../utils/retrieve-if-has-or-create.js';

const positionElementRelativeTo = (
  orienteer,
  element,
  position = 'OR',
  mode = 'MAX',
) => {
  const orienteerRect = orienteer.getBoundingClientRect();
  const elementSize = Math.min(orienteerRect.width, orienteerRect.height);

  let modX = 0;
  let modY = 0;

  switch (position) {
    case 'OLUC':
      modX = -elementSize;
      modY = -elementSize;
      break;

    case 'OLU':
      modX = 0;
      modY = -elementSize;
      break;

    case 'OCU':
      modX = orienteerRect.width / 2 - elementSize / 2;
      modY = -elementSize;
      break;

    case 'ORU':
      modX = orienteerRect.width - elementSize;
      modY = -elementSize;
      break;

    case 'ORUC':
      modX = orienteerRect.width;
      modY = -elementSize;
      break;

    case 'OL':
      modX = -elementSize;
      modY = 0;
      break;

    case 'IL':
      modX = 0;
      modY = 0;
      break;

    case 'IC':
      modX = orienteerRect.width / 2 - elementSize / 2;
      modY = 0;
      break;

    case 'IR':
      modX = orienteerRect.width - elementSize;
      modY = 0;
      break;

    case 'OR':
      modX = orienteerRect.width;
      modY = 0;
      break;

    case 'OLDC':
      modX = -elementSize;
      modY = elementSize;
      break;

    case 'OLD':
      modX = 0;
      modY = elementSize;
      break;

    case 'OCD':
      modX = orienteerRect.width / 2 - elementSize / 2;
      modY = elementSize;
      break;

    case 'ORD':
      modX = orienteerRect.width - elementSize;
      modY = elementSize;
      break;

    case 'ORDC':
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

  element.style.left = `${orienteerRect.left + modX}px`;
  element.style.top = `${orienteerRect.top + modY}px`;
};

const createBox = (content) => {
  const box = document.createElement('div');
  box.innerHTML = content;
  return box;
};

const createContainer = (id, precedingElement) => {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';
  container.id = id;
  precedingElement.insertAdjacentElement('afterend', container);
  return container;
};

const containerRegistry = new Map();
const boxesRegistry = new Map();

const setBoxEffect = (element, stateValues, validationResult) => {
  const { isValid } = validationResult;
  let box;

  const container = retrieveIfHasOrCreate(
    containerRegistry,
    stateValues.id,
    createContainer,
    stateValues.id,
    element,
  );

  const binaryBox = retrieveIfHasOrCreate(
    boxesRegistry,
    stateValues,
    () => new Map(),
  );

  const { value } = stateValues[isValid];

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
  position: 'OR',
  mode: 'MIN',
  id: 'apply_box_0',
});

export default applyBox;
