import acceptOnlyFunction from '../helpers/accept-only-function.js';
import indexedName from '../utils/indexed-name.js';
import parseArgsByTypes from '../utils/parse-args-by-types.js';
import OrderedTwoKeyedMap from '../types/ordered-two-keyed-map.js';

const { warn } = console;

const createApplyEffect = (
  effectFn,
  defaultStateValues = {
    true: { delay: 0, value: null },
    false: { delay: 0, value: null },
  },
) => {
  acceptOnlyFunction(effectFn);

  const setEffectByValidity = (...args) => {
    const [htmlElement, stateValuesObj, effectID] = parseArgsByTypes(
      args,
      [HTMLElement, Object, String],
      [undefined, undefined, indexedName('applyEffect')],
    );

    const stateValues = { ...defaultStateValues, ...stateValuesObj };

    const timeouts = OrderedTwoKeyedMap();

    const set = (validationResult) => {
      const { target, isValid } = validationResult;
      const element = htmlElement || target;

      if (!element) {
        warn(
          `Target element for ${effectFn.name}: was not set. The effect function will not be called.`,
        );
      } else {
        clearTimeout(timeouts.get(element, effectID));
        timeouts.set(
          element,
          effectID,
          setTimeout(
            effectFn,
            stateValues[isValid].delay,
            element,
            stateValues,
            validationResult,
            effectID,
          ),
        );
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
