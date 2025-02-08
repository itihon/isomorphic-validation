import acceptOnlyFunction from '../helpers/accept-only-function';
import parseArgsByTypes from '../utils/parse-args-by-types';

const { warn } = console;

const setByValidity = (
  effectFn,
  defaultStateValues = {
    true: { delay: 0, value: null },
    false: { delay: 0, value: null },
  },
) => {
  acceptOnlyFunction(effectFn);

  const setEffectByValidity = (...args) => {
    const [htmlElement, stateValues] = parseArgsByTypes(
      args,
      [HTMLElement, Object],
      [undefined, defaultStateValues],
    );

    const timeouts = new Map();

    const set = ({ target, isValid }) => {
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
            isValid,
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

export default setByValidity;
