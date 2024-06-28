import { expect, it, describe, beforeEach, jest } from '@jest/globals';
import ValidityCallbacks from '../../src/types/validity-callbacks.js';

const validCB = jest.fn();
const invalidCB = jest.fn();
const changedCB = jest.fn();
const validatedCB = jest.fn();

describe('ValidityCallbacks', () => {
  beforeEach(() => {
    validCB.mockClear();
    invalidCB.mockClear();
    changedCB.mockClear();
    validatedCB.mockClear();
  });

  it('should set initial value', () => {
    let CBs = ValidityCallbacks(true);
    CBs.valid(validCB)
      .invalid(invalidCB)
      .changed(changedCB)
      .validated(validatedCB);

    expect(CBs.set(true)).toBe(true);
    expect(validCB).toHaveBeenCalledTimes(1);
    expect(invalidCB).toHaveBeenCalledTimes(0);
    expect(changedCB).toHaveBeenCalledTimes(0);
    expect(validatedCB).toHaveBeenCalledTimes(1);

    expect(CBs.set(true)).toBe(true);
    expect(validCB).toHaveBeenCalledTimes(2);
    expect(invalidCB).toHaveBeenCalledTimes(0);
    expect(changedCB).toHaveBeenCalledTimes(0);
    expect(validatedCB).toHaveBeenCalledTimes(2);

    expect(CBs.set(false)).toBe(false);
    expect(validCB).toHaveBeenCalledTimes(2);
    expect(invalidCB).toHaveBeenCalledTimes(1);
    expect(changedCB).toHaveBeenCalledTimes(1);
    expect(validatedCB).toHaveBeenCalledTimes(3);

    CBs = ValidityCallbacks();
    CBs.valid(validCB)
      .invalid(invalidCB)
      .changed(changedCB)
      .validated(validatedCB);

    expect(CBs.set(true)).toBe(true);
    expect(validCB).toHaveBeenCalledTimes(3);
    expect(invalidCB).toHaveBeenCalledTimes(1);
    expect(changedCB).toHaveBeenCalledTimes(2);
    expect(validatedCB).toHaveBeenCalledTimes(4);

    expect(CBs.set(true)).toBe(true);
    expect(validCB).toHaveBeenCalledTimes(4);
    expect(invalidCB).toHaveBeenCalledTimes(1);
    expect(changedCB).toHaveBeenCalledTimes(2);
    expect(validatedCB).toHaveBeenCalledTimes(5);

    expect(CBs.set(false)).toBe(false);
    expect(validCB).toHaveBeenCalledTimes(4);
    expect(invalidCB).toHaveBeenCalledTimes(2);
    expect(changedCB).toHaveBeenCalledTimes(3);
    expect(validatedCB).toHaveBeenCalledTimes(6);
  });

  it('should accept anything as the second argument and pass callbacks through if wrapped in another ValidityCallbacks', () => {
    const CBs1 = ValidityCallbacks();
    CBs1.valid(validCB)
      .invalid(invalidCB)
      .changed(changedCB)
      .validated(validatedCB);

    const results = [
      ValidityCallbacks(),
      ValidityCallbacks(false, null),
      ValidityCallbacks(false),
      ValidityCallbacks(false, 'asdf'),
      ValidityCallbacks(false, 42),
      ValidityCallbacks(false, { a: 42 }),
      ValidityCallbacks(false, {}),
      ValidityCallbacks(false, () => {}),
      ValidityCallbacks(false, ['asdf']),
      ValidityCallbacks(false, []),
      ValidityCallbacks(false, CBs1),
    ]
      .map((CBs) =>
        CBs.valid(validCB)
          .invalid(invalidCB)
          .changed(changedCB)
          .validated(validatedCB),
      )
      .map((CBs) => ValidityCallbacks(false, CBs).set(true));

    expect(results).toStrictEqual(
      Array.from({ length: results.length }, () => true),
    );
    expect(validCB).toHaveBeenCalledTimes(results.length + 1);
    expect(invalidCB).toHaveBeenCalledTimes(0);
    expect(changedCB).toHaveBeenCalledTimes(results.length + 1);
    expect(validatedCB).toHaveBeenCalledTimes(results.length + 1);
  });

  it('should expose callbacks via valueOf', () => {
    const CBs1 = ValidityCallbacks();
    CBs1.valid(validCB)
      .invalid(invalidCB)
      .changed(changedCB)
      .validated(validatedCB);

    const CBs2 = ValidityCallbacks(false, CBs1);

    const { validCBs, invalidCBs, changedCBs, validatedCBs } = CBs2.valueOf();

    expect(validCBs).toContain(validCB);
    expect(invalidCBs).toContain(invalidCB);
    expect(changedCBs).toContain(changedCB);
    expect(validatedCBs).toContain(validatedCB);
  });

  it('should pass arguments to callbacks', () => {
    const args1 = ['arguments', 1];
    const args2 = { prop1: 'arguments', prop: 2 };
    const CBs = ValidityCallbacks();

    CBs.valid(validCB)
      .invalid(invalidCB)
      .changed(changedCB)
      .validated(validatedCB);

    CBs.set(true, args1);
    expect(validCB.mock.calls).toStrictEqual([[args1]]);
    expect(invalidCB.mock.calls).toStrictEqual([]);
    expect(changedCB.mock.calls).toStrictEqual([[args1]]);
    expect(validatedCB.mock.calls).toStrictEqual([[args1]]);

    CBs.set(false, args2);
    expect(validCB.mock.calls).toStrictEqual([[args1]]);
    expect(invalidCB.mock.calls).toStrictEqual([[args2]]);
    expect(changedCB.mock.calls).toStrictEqual([[args1], [args2]]);
    expect(validatedCB.mock.calls).toStrictEqual([[args1], [args2]]);
  });
});
