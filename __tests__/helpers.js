import { it } from '@jest/globals';

it('import it to use helpers in tests', () => {});
export const someHelper = () => null;

export const toProtos = (arg = [[]]) =>
  Array.isArray(arg) ? arg.flatMap(toProtos) : [Object.getPrototypeOf(arg)];
