const toEventHandler =
  (stateCallback, isValid = false) =>
  ({ target }) =>
    stateCallback({ target, isValid });

export default toEventHandler;
