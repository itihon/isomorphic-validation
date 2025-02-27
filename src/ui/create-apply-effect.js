import acceptOnlyFunction from '../helpers/accept-only-function.js';
import indexedName from '../utils/indexed-name.js';
import parseArgsByTypes from '../utils/parse-args-by-types.js';
import OrderedTwoKeyedMap from '../types/ordered-two-keyed-map.js';
import { IS_SERVER } from '../utils/getenv.js';

const { warn } = console;
const emptyFns = [() => {}, () => {}];
const setEffectByValidityEmpty = () => emptyFns;

const createApplyEffect = (
  effectFn,
  defaultStateValues = {
    true: { delay: 0, value: null },
    false: { delay: 0, value: null },
  },
) => {
  if (IS_SERVER) {
    warn(
      `[isomorphic-validation/ui]: Function ${effectFn.name} has no effect on the server side.`,
    );
    return setEffectByValidityEmpty;
  }

  acceptOnlyFunction(effectFn);

  const timeouts = OrderedTwoKeyedMap();

  const setEffectByValidity = (...args) => {
    const [htmlElement, stateValuesObj, effectID] = parseArgsByTypes(
      args,
      [HTMLElement, Object, String],
      [undefined, defaultStateValues, indexedName('applyEffect')],
    );

    const stateValues = {
      ...defaultStateValues,
      ...stateValuesObj,
      true: { ...defaultStateValues.true, ...stateValuesObj.true },
      false: { ...defaultStateValues.false, ...stateValuesObj.false },
    };

    const set = (validationResult) => {
      const { target, isValid } = validationResult;
      const element = htmlElement || target;

      if (!element) {
        warn(
          `Target element for ${effectFn.name}: was not set. The effect function will not be called.`,
        );
      } else {
        const { delay } = stateValues[isValid];

        if (delay) {
          timeouts.set(
            element,
            effectID,
            setTimeout(
              effectFn,
              delay,
              element,
              stateValues,
              validationResult,
              effectID,
            ),
          );
        } else {
          effectFn(element, stateValues, validationResult, effectID);
        }
      }
    };

    const cancel = ({ target }) => {
      const element = htmlElement || target;

      if (!element) {
        warn(
          `Target element for ${effectFn.name}: was not set. The effect function will not be cancelled.`,
        );
      } else {
        clearTimeout(timeouts.get(element, effectID));
      }
    };

    return [cancel, set];
  };

  return setEffectByValidity;
};

export default createApplyEffect;
