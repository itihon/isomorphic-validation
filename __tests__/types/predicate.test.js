import { describe, it, expect, jest } from '@jest/globals';
import Predicate from '../../src/types/predicate.js';

const anyData1 = { data: 'data1' };
const anyData2 = { data: 'data2' };

const predicateFn = () => true;
const p1 = Predicate(predicateFn, anyData1);

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

const p2 = Predicate(p1, anyData2);

describe('Predicate', () => {
  it('should accept function or Predicate, throw an error otherwise', () => {
    expect(() => Predicate()).toThrow();
    expect(() => Predicate({})).toThrow();
    expect(() => Predicate([])).toThrow();
    expect(() => Predicate('')).toThrow();
    expect(() => Predicate('asdf')).toThrow();
    expect(() => Predicate(42)).toThrow();
    expect(() => Predicate(class SomeClass {})).toThrow();

    expect(() => Predicate(() => true)).not.toThrow();
    expect(() => Predicate(Predicate(() => true))).not.toThrow();

    expect(() =>
      Predicate(Predicate(() => true).server.valid(() => {}).client),
    ).not.toThrow();

    expect(() =>
      Predicate(Predicate(() => true).client.valid(() => {}).server),
    ).not.toThrow();

    expect(() =>
      Predicate(Predicate(() => true).server.valid(() => {})),
    ).not.toThrow();

    expect(() =>
      Predicate(Predicate(() => true).client.valid(() => {})),
    ).not.toThrow();
  });

  it('should unwrap a predicate function via valueOf being called twice', () => {
    expect(p1.valueOf().valueOf()).toBe(predicateFn);
    expect(p2.valueOf().valueOf()).toBe(predicateFn);
  });

  it('should unwrap stateCBs and anyData after the first call of valueOf', () => {
    const { stateCBs } = p2.valueOf();
    const { validCBs, invalidCBs, changedCBs, validatedCBs } =
      stateCBs.valueOf();

    const { anyData } = p1.valueOf();

    expect(validCBs).toContain(validCB);
    expect(invalidCBs).toContain(invalidCB);
    expect(changedCBs).toContain(changedCB);
    expect(validatedCBs).toContain(validatedCB);

    expect(anyData).toStrictEqual(anyData1);
  });

  it('should clone and override anyData', () => {
    const someData = { data: 'some data' };

    const p2c = Predicate(p2);
    const p2o = Predicate(p2, someData);

    const { anyData } = p2.valueOf();
    const { anyData: anyData2c } = p2c.valueOf();
    const { anyData: anyData2o } = p2o.valueOf();

    expect(anyData).toStrictEqual(anyData2);
    expect(anyData2c).toStrictEqual(anyData2);
    expect(anyData2o).toStrictEqual(someData);
  });
});
