const allInvalid = (validationResult) => {
  const it = validationResult[Symbol.iterator]();
  const result = [];
  let { value, done } = it.next();

  while (!done) {
    const { 0: obj, 1: validator } = value;
    if (!validator.isValid) {
      result.push([obj, validator]);
    }
    ({ value, done } = it.next());
  }

  return result.length ? result : [[]];
};

export default allInvalid;
