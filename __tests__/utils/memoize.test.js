import { describe, it, expect, jest } from '@jest/globals';
import memoize from '../../src/utils/memoize.js';

const sum = jest.fn((a = 0, b = 0, ...args) =>
  Promise.resolve(args.reduce((acc, arg) => acc + arg, a + b)),
);

const memoizedSum = memoize(sum, [0, 0, 0, 0, 0]);

describe('memoize (with default parameters)', () => {
  it('should forget a memoized result', () => {
    expect(memoizedSum(1, 2, 3)).resolves.toBe(6);
    expect(sum).toHaveBeenCalledTimes(1);

    expect(memoizedSum(1, 2, 3, 0, 0)).resolves.toBe(6);
    expect(sum).toHaveBeenCalledTimes(1);

    expect(memoizedSum(1, 2, 2)).resolves.toBe(5);
    expect(sum).toHaveBeenCalledTimes(2);

    expect(memoizedSum(1, 2, 3, 0)).resolves.toBe(6);
    expect(sum).toHaveBeenCalledTimes(2);

    expect(memoizedSum.forget(1, 2, 3, 0)).toBe(true);
    expect(memoizedSum(1, 2, 3)).resolves.toBe(6);
    expect(sum).toHaveBeenCalledTimes(3);

    expect(memoizedSum(1, 2, 3)).resolves.toBe(6);
    expect(sum).toHaveBeenCalledTimes(3);
  });

  it('should remember a new result', () => {
    expect(memoizedSum.forget(1, 2, 2, 0, 0)).toBe(true);
    const meaning = { value: 42 };
    memoizedSum.remember(meaning, 1, 2, 2);

    expect(memoizedSum(1, 2, 2)).toBe(meaning);
    expect(sum).toHaveBeenCalledTimes(3);

    expect(memoizedSum(1, 2, 2, 0)).toBe(meaning);
    expect(sum).toHaveBeenCalledTimes(3);

    expect(memoizedSum(1, 2, 2, 0, 0)).toBe(meaning);
    expect(sum).toHaveBeenCalledTimes(3);
  });
});
