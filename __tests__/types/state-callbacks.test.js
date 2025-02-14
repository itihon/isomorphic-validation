import { expect, it, describe, beforeEach, jest } from '@jest/globals';
import StateCallbacks from '../../src/types/state-callbacks.js';
import { toProtos } from '../helpers.js';
import makeRunStateCBsFn from '../../src/helpers/make-run-state-cbs-fn.js';

const validCB = jest.fn();
const invalidCB = jest.fn();
const changedCB = jest.fn();
const validatedCB = jest.fn();

describe('StateCallbacks', () => {
  beforeEach(() => {
    validCB.mockClear();
    invalidCB.mockClear();
    changedCB.mockClear();
    validatedCB.mockClear();
  });

  it('should run callbacks', () => {
    let CBs = StateCallbacks();
    CBs.valid(validCB)
      .invalid(invalidCB)
      .changed(changedCB)
      .validated(validatedCB);

    const runStateCBs = makeRunStateCBsFn(CBs);

    expect(runStateCBs(true)).toBe(true);
    expect(validCB).toHaveBeenCalledTimes(1);
    expect(invalidCB).toHaveBeenCalledTimes(0);
    expect(changedCB).toHaveBeenCalledTimes(0);
    expect(validatedCB).toHaveBeenCalledTimes(1);

    expect(runStateCBs(true)).toBe(true);
    expect(validCB).toHaveBeenCalledTimes(2);
    expect(invalidCB).toHaveBeenCalledTimes(0);
    expect(changedCB).toHaveBeenCalledTimes(0);
    expect(validatedCB).toHaveBeenCalledTimes(2);

    expect(runStateCBs(false)).toBe(false);
    CBs.runChanged();
    expect(validCB).toHaveBeenCalledTimes(2);
    expect(invalidCB).toHaveBeenCalledTimes(1);
    expect(changedCB).toHaveBeenCalledTimes(1);
    expect(validatedCB).toHaveBeenCalledTimes(3);

    CBs = StateCallbacks();
    CBs.valid(validCB)
      .invalid(invalidCB)
      .changed(changedCB)
      .validated(validatedCB);

    expect(runStateCBs(true)).toBe(true);
    CBs.runChanged();
    expect(validCB).toHaveBeenCalledTimes(3);
    expect(invalidCB).toHaveBeenCalledTimes(1);
    expect(changedCB).toHaveBeenCalledTimes(2);
    expect(validatedCB).toHaveBeenCalledTimes(4);

    expect(runStateCBs(true)).toBe(true);
    expect(validCB).toHaveBeenCalledTimes(4);
    expect(invalidCB).toHaveBeenCalledTimes(1);
    expect(changedCB).toHaveBeenCalledTimes(2);
    expect(validatedCB).toHaveBeenCalledTimes(5);

    expect(runStateCBs(false)).toBe(false);
    CBs.runChanged();
    expect(validCB).toHaveBeenCalledTimes(4);
    expect(invalidCB).toHaveBeenCalledTimes(2);
    expect(changedCB).toHaveBeenCalledTimes(3);
    expect(validatedCB).toHaveBeenCalledTimes(6);
  });

  it('should accept anything as the first argument and pass callbacks through if wrapped in another StateCallbacks', () => {
    const CBs1 = StateCallbacks();
    CBs1.valid(validCB)
      .invalid(invalidCB)
      .changed(changedCB)
      .validated(validatedCB);

    const callbacks = [
      StateCallbacks(),
      StateCallbacks(null),
      StateCallbacks(),
      StateCallbacks('asdf'),
      StateCallbacks(42),
      StateCallbacks({ a: 42 }),
      StateCallbacks({}),
      StateCallbacks(() => {}),
      StateCallbacks(['asdf']),
      StateCallbacks([]),
      StateCallbacks(CBs1),
    ];

    callbacks
      .map((CBs) =>
        CBs.valid(validCB)
          .invalid(invalidCB)
          .changed(changedCB)
          .validated(validatedCB),
      )
      .forEach((CBs) => {
        const CBsCloned = StateCallbacks(CBs);
        const runStateCBs = makeRunStateCBsFn(CBsCloned);
        runStateCBs(true);
        CBsCloned.runChanged();
      });

    expect(validCB).toHaveBeenCalledTimes(callbacks.length + 1);
    expect(invalidCB).toHaveBeenCalledTimes(0);
    expect(changedCB).toHaveBeenCalledTimes(callbacks.length + 1);
    expect(validatedCB).toHaveBeenCalledTimes(callbacks.length + 1);
  });

  it('should expose callbacks via valueOf', () => {
    const CBs1 = StateCallbacks();
    CBs1.valid(validCB)
      .invalid(invalidCB)
      .changed(changedCB)
      .validated(validatedCB);

    const CBs2 = StateCallbacks(CBs1);

    const { validCBs, invalidCBs, changedCBs, validatedCBs } = CBs2.valueOf();

    expect(validCBs).toContain(validCB);
    expect(invalidCBs).toContain(invalidCB);
    expect(changedCBs).toContain(changedCB);
    expect(validatedCBs).toContain(validatedCB);
  });

  it('should pass arguments to callbacks', () => {
    const args1 = ['arguments', 1];
    const args2 = { prop1: 'arguments', prop: 2 };
    const CBs = StateCallbacks();

    CBs.valid(validCB)
      .invalid(invalidCB)
      .changed(changedCB)
      .validated(validatedCB);

    CBs.setArg(args1);

    const runStateCBs = makeRunStateCBsFn(CBs);

    runStateCBs(true);
    CBs.runChanged();
    expect(toProtos(validCB.mock.calls)).toStrictEqual([args1]);
    expect(toProtos(invalidCB.mock.calls)).toStrictEqual([]);
    expect(toProtos(changedCB.mock.calls)).toStrictEqual([args1]);
    expect(toProtos(validatedCB.mock.calls)).toStrictEqual([args1]);

    CBs.setArg(args2);

    runStateCBs(false);
    CBs.runChanged();
    expect(toProtos(validCB.mock.calls)).toStrictEqual([args1]);
    expect(toProtos(invalidCB.mock.calls)).toStrictEqual([args2]);
    expect(toProtos(changedCB.mock.calls)).toStrictEqual([args1, args2]);
    expect(toProtos(validatedCB.mock.calls)).toStrictEqual([args1, args2]);
  });

  it('should clone an instance passed as the first parameter', () => {
    const validCB1 = jest.fn();
    const invalidCB1 = jest.fn();
    const changedCB1 = jest.fn();
    const validatedCB1 = jest.fn();

    const validCB2 = jest.fn();
    const invalidCB2 = jest.fn();
    const changedCB2 = jest.fn();
    const validatedCB2 = jest.fn();

    const CBs1 = StateCallbacks();

    CBs1.valid(validCB1)
      .invalid(invalidCB1)
      .changed(changedCB1)
      .validated(validatedCB1);

    const CBs2 = StateCallbacks(CBs1);

    CBs2.valid(validCB2)
      .invalid(invalidCB2)
      .changed(changedCB2)
      .validated(validatedCB2);

    const runStateCBs1 = makeRunStateCBsFn(CBs1);
    const runStateCBs2 = makeRunStateCBsFn(CBs2);

    runStateCBs1(true);
    CBs1.runChanged();

    expect(validCB1).toHaveBeenCalledTimes(1);
    expect(invalidCB1).toHaveBeenCalledTimes(0);
    expect(changedCB1).toHaveBeenCalledTimes(1);
    expect(validatedCB1).toHaveBeenCalledTimes(1);

    expect(validCB2).toHaveBeenCalledTimes(0);
    expect(invalidCB2).toHaveBeenCalledTimes(0);
    expect(changedCB2).toHaveBeenCalledTimes(0);
    expect(validatedCB2).toHaveBeenCalledTimes(0);

    runStateCBs2(true);
    CBs2.runChanged();

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
