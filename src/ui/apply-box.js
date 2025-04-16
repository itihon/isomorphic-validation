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

const boxStyle = {
  position: 'relative',
  width: '',
  height: '',
  display: 'grid',
  justifyContent: '',
  alignItems: 'center',
};

const createBox = (content) => {
  const box = document.createElement('div');
  box.innerHTML = content;
  return box;
};

const adjustContainer = (targetElement, targetRect, ctx) => {
  if (!targetElement.offsetParent) {
    ctx.containerStyle.display = 'none';
    return;
  }

  const { left, top } = targetRect;
  const {
    startingPoint,
    containerStyle,
    position,
    mode,
    box,
    stateValuesStyle,
  } = ctx;

  const { left: containerInitLeft, top: containerInitTop } =
    startingPoint.getBoundingClientRect();

  const translateX = left - containerInitLeft;
  const translateY = top - containerInitTop;

  const [VERT] = position.split('_', 1);
  const [, ...HOR] = position.split('_', 3);

  const offsetY = positions[VERT].translateY(targetElement.offsetHeight);
  const offsetX = positions[HOR.join('_')].translateX(
    targetElement.offsetWidth,
    targetElement.offsetHeight,
  );

  const { offsetWidth, offsetHeight } = targetElement;

  switch (mode) {
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

  Object.assign(box.style, boxStyle, stateValuesStyle);

  containerStyle.transform = `${offsetX} ${offsetY} translate(${translateX}px, ${translateY}px)`;
  containerStyle.display = 'block';
};

const createContainer = (
  where,
  id,
  target,
  position,
  mode,
  box,
  stateValuesStyle,
) => {
  const container = document.createElement('div');
  const startingPoint = document.createElement('div');
  const { style: containerStyle } = container;
  const ctx = {
    containerStyle,
    startingPoint,
    position,
    mode,
    box,
    stateValuesStyle,
  };
  const observer = new PositionObserver(adjustContainer, ctx);

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
  target.offsetParent.appendChild(startingPoint);

  observer.observe(target);

  return { container, observer, ctx };
};

const containerRegistry = new Map();
const boxesRegistry = new Map();

const setBoxEffect = (element, stateValues, validationResult, id) => {
  // if (!element.offsetParent) {
  //  return;
  // }

  const { isValid } = validationResult;
  const { parentNode } = element;
  let box;

  const binaryBox = retrieveIfHasOrCreate(boxesRegistry, stateValues, newMap);

  const { value } = stateValues[isValid];

  if (typeof value === 'function') {
    box = retrieveIfHasOrCreate(binaryBox, isValid, createBox, '');
    box.innerHTML = value(validationResult);
  } else {
    box = retrieveIfHasOrCreate(binaryBox, isValid, createBox, value);
  }

  const { container, observer, ctx } = retrieveIfHasOrCreate(
    containerRegistry,
    id,
    createContainer,
    parentNode,
    id,
    element,
    stateValues.position,
    stateValues.mode,
    box,
    stateValues.style,
  );

  ctx.position = stateValues.position;
  ctx.mode = stateValues.mode;
  ctx.box = box;
  ctx.stateValuesStyle = stateValues.style;

  // for (const target of observer.getTargets()) {
  //  if (target !== element) observer.unobserve(target);
  // }
  observer.disconnect();
  observer.observe(element);

  if (container.parentNode !== parentNode) {
    parentNode.appendChild(container);
  }

  while (container.hasChildNodes()) {
    container.lastElementChild.remove();
  }

  if (box.hasChildNodes()) {
    container.style.display = 'block';
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
