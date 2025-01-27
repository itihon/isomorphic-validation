import StateCallbacks from '../types/state-callbacks.js';

const makeRunStateCBsFn =
  (CBs = StateCallbacks()) =>
  (value) => {
    if (value) {
      CBs.runValid();
    } else {
      CBs.runInvalid();
    }

    CBs.runValidated();

    return value;
  };

export default makeRunStateCBsFn;
