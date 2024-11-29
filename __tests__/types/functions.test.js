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

  it('should accept only an iterable of functions and throw an error otherwise', () => {
    expect(() => Functions([a, x, b, y, c, z])).toThrow();
    expect(() => Functions([x, y, z])).toThrow();
    expect(() => Functions(y)).toThrow(); // empty object is not iterable
    expect(() => Functions(a)).toThrow();
    expect(() => Functions('a')).toThrow();
    expect(() => Functions(x)).not.toThrow(); // empty string
    expect(() => Functions(z)).not.toThrow(); // empty array
    expect(Functions([a, b])).toHaveLength(2);
  });

  it('should accept only functions and throw an error otherwise', () => {
    expect(() => Functions([a]).push(x, b).push(y, c, z)).toThrow();
    expect(Functions([a, b]).push(c).push(i, j, k)).toHaveLength(6);
  });

  it("should pass parameters to functions and return an array of functions' results", () => {
    expect(Functions([a, b, c, i, j, k]).run(2)).toStrictEqual([
      undefined,
      undefined,
      undefined,
      42,
      2,
      '42',
    ]);
  });
});
