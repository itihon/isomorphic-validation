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

    let timeout;

    const effectFnWrapper = ({ target, isValid }) => {
      const element = htmlElement || target;

      if (!element) {
        warn(
          `Target element for ${effectFn.name}: was not set. The effect function will not be called.`,
        );
      } else {
        effectFn(element, stateValues, isValid);
      }
    };

    const set = (validationResult) => {
      const { isValid } = validationResult;
      clearTimeout(timeout);
      timeout = setTimeout(
        effectFnWrapper,
        stateValues[isValid].delay,
        validationResult,
      );
    };

    const cancel = () => clearInterval(timeout);

    return [cancel, set];
  };

  return setEffectByValidity;
};

export default setByValidity;
