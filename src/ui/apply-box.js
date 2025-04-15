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

const adjustContainer = (targetElement, targetRect, ctx) => {
  const { left, top } = targetRect;
  const { startingPoint, containerStyle } = ctx;

  const { left: containerInitLeft, top: containerInitTop } =
    startingPoint.getBoundingClientRect();

  const translateX = left - containerInitLeft;
  const translateY = top - containerInitTop;

  containerStyle.transform = `var(--translateX) var(--translateY) translate(${translateX}px, ${translateY}px)`;

  if (!targetElement.offsetParent) {
    containerStyle.display = 'none';
  } else {
    containerStyle.display = 'block';
  }
};

const createContainer = (where, id, target) => {
  const container = document.createElement('div');
  const startingPoint = document.createElement('div');
  const { style: containerStyle } = container;
  const ctx = { containerStyle, startingPoint };
  const observer = new PositionObserver(adjustContainer, ctx);

  containerStyle.setProperty('--translateX', 'translateX(0)');
  containerStyle.setProperty('--translateY', 'translateY(0)');
  containerStyle.position = 'absolute';
  containerStyle.left = '0';
  containerStyle.top = '0';

  startingPoint.style.position = 'absolute';
  startingPoint.style.left = '0';
  startingPoint.style.top = '0';
  startingPoint.style.width = '0';
  startingPoint.style.height = '0';

  container.id = id;
  startingPoint.dataset.for = 'apply-box-starting-point';

  where.appendChild(container);
  where.appendChild(startingPoint);

  observer.observe(target);

  return { container, observer };
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

  const { container, observer } = retrieveIfHasOrCreate(
    containerRegistry,
    id,
    createContainer,
    parentNode,
    id,
    element,
  );

  for (const target of observer.getTargets()) {
    if (target !== element) observer.unobserve(target);
  }

  observer.observe(element);

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

    container.style.display = 'block';
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
