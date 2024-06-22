import { describe, it, expect } from '@jest/globals';
import Functions from '../../src/types/functions.js';

describe('Functions', () => {
  const a = () => {};
  const b = () => {};
  const c = () => {};
  const i = (x) => 40 + x;
  const j = (x) => x;
  const k = (x) => `4${x}`;
  const x = '';
  const y = {};
  const z = [];

  it('should accept only an iterable of functions and filter out everything else', () => {
    expect(Functions([a, x, b, y, c, z])).toStrictEqual(Functions([a, b, c]));

    expect(Functions([a, x, b, y, c, z])).toHaveLength(3);

    expect(Functions([x, y, z])).toStrictEqual(Functions([]));

    expect(Functions([x, y, z])).toHaveLength(0);

    expect(Functions(x)).toStrictEqual(Functions([]));

    expect(Functions([x])).toHaveLength(0);

    expect(Functions(y)).toStrictEqual(Functions([]));

    expect(Functions([y])).toHaveLength(0);

    expect(Functions(z)).toStrictEqual(Functions([]));

    expect(Functions([z])).toHaveLength(0);

    expect(Functions(a)).toStrictEqual(Functions([]));

    expect(Functions([])).toHaveLength(0);
  });

  it('should accept only functions and filter out everything else', () => {
    const fns = Functions([a]).push(x, b).push(y, c, z);

    expect(fns).toStrictEqual(Functions([a, b, c]));

    expect(fns).toHaveLength(3);
  });

  it("should pass parameters to functions and return an array of functions' results", () => {
    expect(Functions([a, b, c, i, j, k, x, y, z]).run(2)).toStrictEqual([
      undefined,
      undefined,
      undefined,
      42,
      2,
      '42',
    ]);
  });
});
