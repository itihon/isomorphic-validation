import { getTypeOf, isType } from './gettype.js';

const parseArgsByTypes = (args = [], types = [], defaultValues = []) => {
  const fnName = 'parseArgsByTypes';

  if ([...new Set(types)].length !== types.length)
    throw new Error(`${fnName}: types must be unique.`);

  if (args.length > types.length)
    throw new Error(`${fnName}: more arguments were passed than expected.`);

  const res = types.map((_, idx) => defaultValues[idx]);
  const seenTypes = new Set();

  args.forEach((arg) => {
    let position;

    types.some((type, idx) => {
      if (isType(arg, type)) {
        if (!seenTypes.has(type)) {
          seenTypes.add(type);
          position = idx;
          return true;
        }
        throw new Error(`${fnName}: type ${getTypeOf(arg)} wasn't expected`);
      }
      return false;
    });

    if (position === undefined) {
      throw new Error(`${fnName}: type ${getTypeOf(arg)} wasn't expected`);
    }

    res[position] = arg;
  });

  return res;
};

export default parseArgsByTypes;
