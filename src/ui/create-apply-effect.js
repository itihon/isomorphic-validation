import acceptOnlyFunction from '../helpers/accept-only-function';
import parseArgsByTypes from '../utils/parse-args-by-types';

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
    const [htmlElement, stateValuesObj] = parseArgsByTypes(
      args,
      [HTMLElement, Object],
      [undefined, undefined],
    );

    const stateValues = { ...defaultStateValues, ...stateValuesObj };

    const timeouts = new Map();

    const set = (validationResult) => {
      const { target, isValid } = validationResult;
      const element = htmlElement || target;

      if (!element) {
        warn(
          `Target element for ${effectFn.name}: was not set. The effect function will not be called.`,
        );
      } else {
        clearTimeout(timeouts.get(element));
        timeouts.set(
          element,
          setTimeout(
            effectFn,
            stateValues[isValid].delay,
            element,
            stateValues,
            validationResult,
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
        clearTimeout(timeouts.get(element));
      }
    };

    return [cancel, set];
  };

  return setEffectByValidity;
};

export default createApplyEffect;
