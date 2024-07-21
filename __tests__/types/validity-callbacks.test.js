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

  it('should clone an instance passed as the second parameter', () => {
    const validCB1 = jest.fn();
    const invalidCB1 = jest.fn();
    const changedCB1 = jest.fn();
    const validatedCB1 = jest.fn();

    const validCB2 = jest.fn();
    const invalidCB2 = jest.fn();
    const changedCB2 = jest.fn();
    const validatedCB2 = jest.fn();

    const CBs1 = ValidityCallbacks();

    CBs1.valid(validCB1)
      .invalid(invalidCB1)
      .changed(changedCB1)
      .validated(validatedCB1);

    const CBs2 = ValidityCallbacks(false, CBs1);

    CBs2.valid(validCB2)
      .invalid(invalidCB2)
      .changed(changedCB2)
      .validated(validatedCB2);

    CBs1.set(true);

    expect(validCB1).toHaveBeenCalledTimes(1);
    expect(invalidCB1).toHaveBeenCalledTimes(0);
    expect(changedCB1).toHaveBeenCalledTimes(1);
    expect(validatedCB1).toHaveBeenCalledTimes(1);

    expect(validCB2).toHaveBeenCalledTimes(0);
    expect(invalidCB2).toHaveBeenCalledTimes(0);
    expect(changedCB2).toHaveBeenCalledTimes(0);
    expect(validatedCB2).toHaveBeenCalledTimes(0);

    CBs2.set(true);

    expect(validCB1).toHaveBeenCalledTimes(2);
    expect(invalidCB1).toHaveBeenCalledTimes(0);
    expect(changedCB1).toHaveBeenCalledTimes(2);
    expect(validatedCB1).toHaveBeenCalledTimes(2);

    expect(validCB2).toHaveBeenCalledTimes(1);
    expect(invalidCB2).toHaveBeenCalledTimes(0);
    expect(changedCB2).toHaveBeenCalledTimes(1);
    expect(validatedCB2).toHaveBeenCalledTimes(1);

    const {
      validCBs: validCBs1,
      invalidCBs: invalidCBs1,
      changedCBs: changedCBs1,
      validatedCBs: validatedCBs1,
    } = CBs1.valueOf();

    const {
      validCBs: validCBs2,
      invalidCBs: invalidCBs2,
      changedCBs: changedCBs2,
      validatedCBs: validatedCBs2,
    } = CBs2.valueOf();

    expect(validCBs1).not.toBe(validCBs2);
    expect(invalidCBs1).not.toBe(invalidCBs2);
    expect(changedCBs1).not.toBe(changedCBs2);
    expect(validatedCBs1).not.toBe(validatedCBs2);
  });
});
