import PositionObserver from '@itihon/position-observer';
import createApplyEffect from './create-apply-effect.js';
import retrieveIfHasOrCreate, {
  newMap,
} from '../utils/retrieve-if-has-or-create.js';

const positions = {
  ABOVE: { translateY: () => `translateY(-100%)` },
  LEVEL: { translateY: (offset) => `translateY(calc(${offset / 2}px - 50%))` },
  BELOW: { translateY: (offset) => `translateY(${offset}px)` },
  LEFT_BESIDE: { translateX: () => `translateX(-100%)` },
  LEFT: {
    translateX: (_, offsetHeight) =>
      `translateX(calc(-100% + ${offsetHeight}px))`,
  },
  CENTER: {
    translateX: (offsetWidth) => `translateX(calc(${offsetWidth / 2}px - 50%))`,
  },
  RIGHT: {
    translateX: (offsetWidth, offsetHeight) =>
      `translateX(${offsetWidth - offsetHeight}px)`,
  },
  RIGHT_BESIDE: { translateX: (offsetWidth) => `translateX(${offsetWidth}px)` },
};

const createBox = (content) => {
  const box = document.createElement('div');
  box.innerHTML = content;
  return box;
};

const createContainer = (where, id, target) => {
  const container = document.createElement('div');
  const { style } = container;

  container.style.setProperty('--translateX', 'translateX(0)');
  container.style.setProperty('--translateY', 'translateY(0)');
  style.position = 'absolute';
  style.left = '0';
  style.top = '0';

  container.id = id;
  where.appendChild(container);

  const observer = new PositionObserver((targetElement, targetRect) => {
    const { left, top } = targetRect;

    container.style.transform = ''; // put container to its coordinate system's start point

    const { left: containerLeft, top: containerTop } =
      container.getBoundingClientRect();

    const translateX = left - containerLeft;
    const translateY = top - containerTop;

    container.style.transform = `var(--translateX) var(--translateY) translate(${translateX}px, ${translateY}px)`;
  });

  observer.observe(target);

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

  const boxStyle = {
    position: 'relative',
    width: '',
    height: '',
    display: 'grid',
    justifyContent: '',
    alignItems: 'center',
  };

  const container = retrieveIfHasOrCreate(
    containerRegistry,
    id,
    createContainer,
    parentNode,
    id,
    element,
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

  if (box.hasChildNodes()) {
    const { offsetWidth, offsetHeight } = element;

    switch (stateValues.mode) {
      case 'MIN_SIDE':
        boxStyle.width = `${offsetHeight}px`;
        boxStyle.height = `${offsetHeight}px`;
        boxStyle.justifyContent = 'center';
        break;

      case 'MAX_SIDE':
        boxStyle.width = `${offsetWidth}px`;
        boxStyle.height = ``;
        boxStyle.justifyContent = '';
        break;

      default:
        break;
    }

    const [VERT] = stateValues.position.split('_', 1);
    const [, ...HOR] = stateValues.position.split('_', 3);

    const translateY = positions[VERT].translateY(element.offsetHeight);
    const translateX = positions[HOR.join('_')].translateX(
      element.offsetWidth,
      element.offsetHeight,
    );

    container.style.setProperty('--translateY', translateY);
    container.style.setProperty('--translateX', translateX);

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
