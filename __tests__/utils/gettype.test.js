import { describe, expect, it } from '@jest/globals';
import { isType, getTypeOf } from '../../src/utils/gettype.js';

class Type {}

describe('isType', () => {
  it('should confirm value-type correlation', () => {
    expect(isType({}, Object)).toBe(true);
    expect(isType([], Array)).toBe(true);
    expect(isType('', String)).toBe(true);
    expect(isType(true, Boolean)).toBe(true);
    expect(isType(() => {}, Function)).toBe(true);
    expect(isType(new Type(), Type)).toBe(true);

    expect(isType([], Object)).toBe(false);
    expect(isType('', Object)).toBe(false);
    expect(isType(true, Object)).toBe(false);
    expect(isType(() => {}, Object)).toBe(false);
    expect(isType(new Type(), Object)).toBe(false);
  });

  it('should confirm the type returned by getTypeOf', () => {
    expect(isType([], getTypeOf([]))).toBe(true);
    expect(isType('', getTypeOf(''))).toBe(true);
    expect(isType(true, getTypeOf(true))).toBe(true);
    expect(
      isType(
        () => {},
        getTypeOf(() => {}),
      ),
    ).toBe(true);
    expect(isType(new Type(), getTypeOf(new Type()))).toBe(true);
  });
});

describe('getTypeOf', () => {
  it('should return the right type/constructor', () => {
    expect(getTypeOf({})).toBe(Object);
    expect(getTypeOf([])).toBe(Array);
    expect(getTypeOf('')).toBe(String);
    expect(getTypeOf(true)).toBe(Boolean);
    expect(getTypeOf(() => {})).toBe(Function);
    expect(getTypeOf(new Type())).toBe(Type);
  });
});
