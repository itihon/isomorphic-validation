import { it, describe, jest, expect, test, beforeEach } from '@jest/globals';
import ValidatableItem from '../../src/types/validatable-item.js';

const obj1 = { value: 1 };
const obj2 = { value: 2 };
const obj3 = { value: 3 };

describe('ValidatableItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // removed memoization
  it.skip('should return the same instance if the same arguments are passed including default parameters', () => {
    const VIs = [
      [],
      [null, null, null],
      [null, undefined, null],
      [null], // 0
      [null, undefined, undefined], // 0
      [undefined, null],
      [obj1, 'value'], // 1
      [obj1, 'value', ''], // 1
      [obj1, 'value', 0],
      [obj2, 'value'], // 2
      [obj2, 'value', ''], // 2
      [obj2, 'value', 0],
      [() => {}, 42],
      [() => {}, 42, ''],
    ].map((args) => ValidatableItem(...args));

    expect(ValidatableItem(obj1, 'value')).toBe(
      ValidatableItem(obj1, 'value', ''),
    );
    expect(ValidatableItem(obj1)).toBe(ValidatableItem(obj1, '', ''));
    expect(ValidatableItem(obj1)).toBe(ValidatableItem(obj1, ''));

    expect(VIs.length).toBe(14);
    expect(new Set(VIs).size).toBe(11);
  });

  test('getObject, getValue', () => {
    const vi1 = ValidatableItem(obj1, 'value');
    const vi2 = ValidatableItem(obj2, 'value');

    expect(vi1.getObject()).toBe(obj1);
    expect(vi1.getValue()).toBe(1);

    expect(vi2.getObject()).toBe(obj2);
    expect(vi2.getValue()).toBe(2);
  });

  test('keepValid, saveValue, restoreValue, initVal', () => {
    const initVal1 = 'initial value 1';
    const initVal2 = 'initial value 2';

    const vi1 = ValidatableItem(obj1, 'value', initVal1);
    const vi2 = ValidatableItem(obj2, 'value', initVal2);

    expect(vi1.getValue()).toBe(1);
    expect(vi2.getValue()).toBe(2);

    expect(ValidatableItem.keepValid([vi1, vi2], false)).toBe(true);
    expect(vi1.getValue()).toBe(initVal1);
    expect(vi2.getValue()).toBe(initVal2);

    expect(ValidatableItem.keepValid([vi1, vi2], false)).toBe(true);
    expect(vi1.getValue()).toBe(initVal1);
    expect(vi2.getValue()).toBe(initVal2);

    obj1.value = 42;
    obj2.value = 'meaning of life';
    expect(ValidatableItem.keepValid([vi1, vi2], true)).toBe(false);
    expect(vi1.getValue()).toBe(42);
    expect(vi2.getValue()).toBe('meaning of life');

    obj1.value = 7;
    obj2.value = 'lucky number';
    expect(ValidatableItem.keepValid([vi1, vi2], false)).toBe(true);
    expect(vi1.getValue()).toBe(42);
    expect(vi2.getValue()).toBe('meaning of life');

    obj1.value = initVal1;
    obj2.value = initVal2;
    expect(ValidatableItem.keepValid([vi1, vi2], false)).toBe(true);
    expect(vi1.getValue()).toBe(initVal1);
    expect(vi2.getValue()).toBe(initVal2);

    obj1.value = 42;
    obj2.value = 'meaning of life';
    expect(ValidatableItem.keepValid([vi1], false)).toBe(true);
    expect(vi1.getValue()).toBe(initVal1);
    expect(vi2.getValue()).toBe('meaning of life');
  });

  it('should clone an instance', () => {
    const vi1 = ValidatableItem(obj1, 'value', '');
    const vi2 = vi1.clone();
    const vi3 = vi2.clone();

    expect(vi1).not.toBe(vi2);
    expect(vi1).not.toBe(vi3);
    expect(vi2).not.toBe(vi3);

    obj1.value = 42;
    ValidatableItem.keepValid([vi1]);
    expect(obj1.value).toBe('');

    obj1.value = 42;
    ValidatableItem.keepValid([vi2]);
    expect(obj1.value).toBe('');

    obj1.value = 42;
    ValidatableItem.keepValid([vi3]);
    expect(obj1.value).toBe('');

    expect(vi1.clone()).not.toBe(vi1);
    expect(vi1.clone()).not.toBe(vi1.clone()); // after having removed memoization
    expect(vi1.clone()).not.toBe(ValidatableItem(obj1, 'value'));
  });

  it('should change the validated object of an instance', () => {
    const vi1 = ValidatableItem(obj1, 'value');
    // expect(ValidatableItem(obj1, 'value')).toBe(vi1);

    const vi2 = vi1.clone();
    // expect(ValidatableItem(obj1, 'value')).toBe(vi1);
    expect(ValidatableItem(obj1, 'value')).not.toBe(vi2);
    expect(ValidatableItem(obj1, 'value')).not.toBe(vi2);

    // changing the obj of a cloned item
    vi2.setObject(obj2, 'value');
    expect(ValidatableItem(obj1, 'value')).not.toBe(vi1); // should it be so ???
    // expect(ValidatableItem(obj2, 'value')).toBe(vi2);
    expect(ValidatableItem(obj1, 'value')).not.toBe(vi2);

    vi1.setObject(obj3, 'value');
    // expect(ValidatableItem(obj3, 'value')).toBe(vi1);
  });
});
