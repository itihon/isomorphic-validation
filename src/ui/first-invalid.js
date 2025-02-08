const firstInvalid = (validationResult) => {
  const it = validationResult[Symbol.iterator]();
  let { value, done } = it.next();

  while (!done) {
    const { 0: obj, 1: validator } = value;
    if (!validator.isValid) {
      return [obj, validator];
    }
    ({ value, done } = it.next());
  }

  return [];
};

export default firstInvalid;
