import { describe, it, expect, jest } from '@jest/globals';
import Predicate from '../../src/types/predicate.js';

const predicateFn = () => true;
const p1 = Predicate(predicateFn);

const validCB = jest.fn();
const invalidCB = jest.fn();
const changedCB = jest.fn();
const validatedCB = jest.fn();
const restoredCB = jest.fn();

p1.valid(validCB)
  .invalid(invalidCB)
  .changed(changedCB)
  .validated(validatedCB)
  .restored(restoredCB);

const p2 = Predicate(p1);

describe('Predicate', () => {
  it('should accept function or Predicate, return null otherwise', () => {
    expect(Predicate()).toBe(null);
    expect(Predicate({})).toBe(null);
    expect(Predicate([])).toBe(null);
    expect(Predicate('')).toBe(null);
    expect(Predicate('asdf')).toBe(null);
    expect(Predicate(42)).toBe(null);
    expect(Predicate(class SomeClass {})).toBe(null);

    expect(p1).not.toBe(null);
    expect(p2).not.toBe(null);
  });

  it('should unwrap a predicate function via valueOf being called twice', () => {
    expect(p1.valueOf().valueOf()).toBe(predicateFn);
    expect(p2.valueOf().valueOf()).toBe(predicateFn);
  });

  it('should unwrap restoredCBs and validityCBs after the first call of valueOf', () => {
    const { restoredCBs, validityCBs } = p2.valueOf();
    const { validCBs, invalidCBs, changedCBs, validatedCBs } =
      validityCBs.valueOf();

    expect(restoredCBs).toContain(restoredCB);
    expect(validCBs).toContain(validCB);
    expect(invalidCBs).toContain(invalidCB);
    expect(changedCBs).toContain(changedCB);
    expect(validatedCBs).toContain(validatedCB);
  });
});
