import acceptOnlyFunction from '../helpers/accept-only-function';
import parseArgsByTypes from '../utils/parse-args-by-types';

const { warn } = console;

const createApplyEffect = (
  effectFn,
  defaultStateValues = { true: true, false: false },
) => {
  acceptOnlyFunction(effectFn);

  const setEffectByValidity = (...args) => {
    const [htmlElement, delay, stateValues] = parseArgsByTypes(
      args,
      [HTMLElement, Number, Object],
      [undefined, 0, defaultStateValues],
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
      if (delay) {
        clearTimeout(timeout);
        timeout = setTimeout(effectFnWrapper, delay, validationResult);
      } else {
        effectFnWrapper(validationResult);
      }
    };

    const cancel = () => clearInterval(timeout);

    return [cancel, set];
  };

  return setEffectByValidity;
};

export default createApplyEffect;
