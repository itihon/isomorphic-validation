import { it, describe, jest, expect, test, beforeEach } from '@jest/globals';
import ValidatedItem from '../../src/types/validated-item.js';

const obj1 = { value: 1 };
const obj2 = { value: 2 };

const onRestoredCB1 = jest.fn();
const onRestoredCB2 = jest.fn();
const onRestoredCB3 = jest.fn();

describe('ValidatedItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the same instance if the same arguments are passed including default parameters', () => {
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
    ].map((args) => ValidatedItem(...args));

    expect(ValidatedItem(obj1, 'value')).toBe(ValidatedItem(obj1, 'value', ''));
    expect(ValidatedItem(obj1)).toBe(ValidatedItem(obj1, '', ''));
    expect(ValidatedItem(obj1)).toBe(ValidatedItem(obj1, ''));

    expect(VIs.length).toBe(14);
    expect(new Set(VIs).size).toBe(11);
  });

  test('getObject, getValue', () => {
    const vi1 = ValidatedItem(obj1, 'value');
    const vi2 = ValidatedItem(obj2, 'value');

    expect(vi1.getObject()).toBe(obj1);
    expect(vi1.getValue()).toBe(1);

    expect(vi2.getObject()).toBe(obj2);
    expect(vi2.getValue()).toBe(2);
  });

  test('keepValid, saveValue, restoreValue, initVal, onRestored with cbArgs', () => {
    const initVal1 = 'initial value 1';
    const initVal2 = 'initial value 2';

    const vi1 = ValidatedItem(obj1, 'value', initVal1);
    const vi2 = ValidatedItem(obj2, 'value', initVal2);

    vi1.onRestored(onRestoredCB1);
    vi2.onRestored(onRestoredCB2);

    expect(vi1.getValue()).toBe(1);
    expect(vi2.getValue()).toBe(2);

    expect(
      ValidatedItem.keepValid([vi1, vi2], {
        isValid: false,
        desc: 'restored 1',
      }),
    ).toBe(true);
    expect(vi1.getValue()).toBe(initVal1);
    expect(vi2.getValue()).toBe(initVal2);
    expect(onRestoredCB1).toHaveBeenCalledTimes(1);
    expect(onRestoredCB2).toHaveBeenCalledTimes(1);
    expect(onRestoredCB1).lastCalledWith({
      isValid: false,
      desc: 'restored 1',
    });
    expect(onRestoredCB2).lastCalledWith({
      isValid: false,
      desc: 'restored 1',
    });

    expect(
      ValidatedItem.keepValid([vi1, vi2], {
        isValid: false,
        desc: 'restored 2',
      }),
    ).toBe(true);
    expect(vi1.getValue()).toBe(initVal1);
    expect(vi2.getValue()).toBe(initVal2);
    expect(onRestoredCB1).toHaveBeenCalledTimes(2);
    expect(onRestoredCB2).toHaveBeenCalledTimes(2);
    expect(onRestoredCB1).lastCalledWith({
      isValid: false,
      desc: 'restored 2',
    });
    expect(onRestoredCB2).lastCalledWith({
      isValid: false,
      desc: 'restored 2',
    });

    obj1.value = 42;
    obj2.value = 'meaning of life';
    expect(
      ValidatedItem.keepValid([vi1, vi2], { isValid: true, desc: 'saved 1' }),
    ).toBe(false);
    expect(vi1.getValue()).toBe(42);
    expect(vi2.getValue()).toBe('meaning of life');
    expect(onRestoredCB1).toHaveBeenCalledTimes(2);
    expect(onRestoredCB2).toHaveBeenCalledTimes(2);
    expect(onRestoredCB1).lastCalledWith({
      isValid: false,
      desc: 'restored 2',
    });
    expect(onRestoredCB2).lastCalledWith({
      isValid: false,
      desc: 'restored 2',
    });

    obj1.value = 7;
    obj2.value = 'lucky number';
    expect(
      ValidatedItem.keepValid([vi1, vi2], {
        isValid: false,
        desc: 'restored 3',
      }),
    ).toBe(true);
    expect(vi1.getValue()).toBe(42);
    expect(vi2.getValue()).toBe('meaning of life');
    expect(onRestoredCB1).toHaveBeenCalledTimes(3);
    expect(onRestoredCB2).toHaveBeenCalledTimes(3);
    expect(onRestoredCB1).lastCalledWith({
      isValid: false,
      desc: 'restored 3',
    });
    expect(onRestoredCB2).lastCalledWith({
      isValid: false,
      desc: 'restored 3',
    });

    obj1.value = initVal1;
    obj2.value = initVal2;
    expect(
      ValidatedItem.keepValid([vi1, vi2], {
        isValid: false,
        desc: 'restored 4',
      }),
    ).toBe(true);
    expect(vi1.getValue()).toBe(initVal1);
    expect(vi2.getValue()).toBe(initVal2);
    expect(onRestoredCB1).toHaveBeenCalledTimes(4);
    expect(onRestoredCB2).toHaveBeenCalledTimes(4);
    expect(onRestoredCB1).lastCalledWith({
      isValid: false,
      desc: 'restored 4',
    });
    expect(onRestoredCB2).lastCalledWith({
      isValid: false,
      desc: 'restored 4',
    });

    obj1.value = 42;
    obj2.value = 'meaning of life';
    expect(
      ValidatedItem.keepValid([vi1], { isValid: false, desc: 'restored 5' }),
    ).toBe(true);
    expect(vi1.getValue()).toBe(initVal1);
    expect(vi2.getValue()).toBe('meaning of life');
    expect(onRestoredCB1).toHaveBeenCalledTimes(5);
    expect(onRestoredCB2).toHaveBeenCalledTimes(4);
    expect(onRestoredCB1).lastCalledWith({
      isValid: false,
      desc: 'restored 5',
    });
    expect(onRestoredCB2).lastCalledWith({
      isValid: false,
      desc: 'restored 4',
    });
  });

  it('should clone an instance', () => {
    const vi1 = ValidatedItem(obj1, 'value');
    vi1.onRestored(onRestoredCB1);

    const vi2 = vi1.clone();
    vi2.onRestored(onRestoredCB2);

    const vi3 = vi2.clone();
    vi3.onRestored(onRestoredCB3);

    obj1.value = 42;
    ValidatedItem.keepValid([vi1]);
    expect(obj1.value).toBe('');
    expect(onRestoredCB1).toHaveBeenCalledTimes(1);
    expect(onRestoredCB2).toHaveBeenCalledTimes(0);
    expect(onRestoredCB3).toHaveBeenCalledTimes(0);

    obj1.value = 42;
    ValidatedItem.keepValid([vi2]);
    expect(obj1.value).toBe('');
    expect(onRestoredCB1).toHaveBeenCalledTimes(2);
    expect(onRestoredCB2).toHaveBeenCalledTimes(1);
    expect(onRestoredCB3).toHaveBeenCalledTimes(0);

    obj1.value = 42;
    ValidatedItem.keepValid([vi3]);
    expect(obj1.value).toBe('');
    expect(onRestoredCB1).toHaveBeenCalledTimes(3);
    expect(onRestoredCB2).toHaveBeenCalledTimes(2);
    expect(onRestoredCB3).toHaveBeenCalledTimes(1);

    expect(vi1.clone()).not.toBe(vi1);
    expect(vi1.clone()).not.toBe(ValidatedItem(obj1, 'value'));
  });
});
