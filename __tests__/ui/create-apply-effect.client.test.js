/**
 * @jest-environment jsdom
 */
import { describe, expect, it } from '@jest/globals';
import createApplyEffect from '../../src/ui/create-apply-effect';
import wait from '../../src/utils/wait';

describe('createApplyEffect', () => {
  it('accept a function as the first parameter and throw an error otherwise', () => {
    expect(() => createApplyEffect(() => {})).not.toThrow();
    expect(() => createApplyEffect()).toThrow();
    expect(() => createApplyEffect({})).toThrow();
    expect(() => createApplyEffect(class {})).toThrow();
    expect(() => createApplyEffect(null)).toThrow();
    expect(() => createApplyEffect([])).toThrow();
  });

  it('should return a function which accepts optional arguments in any order', () => {
    const htmlElement = document.createElement('div');
    const valuesObj = { true: '', false: '' };
    let effectFnCallCount = 0;

    const effectFn = (element, stateValues, isValid) => {
      expect(element).toBe(htmlElement);
      expect(stateValues).toBe(valuesObj);

      expect(isValid).toBe(Boolean(effectFnCallCount++ % 2));
    };

    const setEffectByValidity = createApplyEffect(effectFn);

    [
      [htmlElement, valuesObj],
      [valuesObj, htmlElement],
      [valuesObj, 0, htmlElement],
      [htmlElement, 0, valuesObj],
      [valuesObj, htmlElement, 0],
      [htmlElement, valuesObj, 0],
      [0, valuesObj, htmlElement],
      [0, htmlElement, valuesObj],
    ].forEach((args, idx) => {
      const [, set] = setEffectByValidity(...args);
      set({ isValid: Boolean(idx % 2) });
    });
  });

  it('should override target element with htmlElement', () => {
    const htmlElement = document.createElement('div');
    const targetElement = document.createElement('div');
    const valuesObj1 = { true: '', false: '' };
    const valuesObj2 = { true: '', false: '' };
    let effectFnCallCount = 0;

    const effectFn = (element, stateValues, isValid) => {
      if (stateValues === valuesObj1) {
        expect(element).toBe(htmlElement);
      }

      if (stateValues === valuesObj2) {
        expect(element).toBe(targetElement);
      }

      expect(isValid).toBe(Boolean(effectFnCallCount++ % 2));
    };

    const setEffectByValidity = createApplyEffect(effectFn);

    [
      [htmlElement, valuesObj1],
      [valuesObj2],
      [valuesObj1, 0, htmlElement],
      [0, valuesObj2],
      [valuesObj1, htmlElement, 0],
      [htmlElement, valuesObj1, 0],
      [0, valuesObj2],
      [0, htmlElement, valuesObj1],
    ].forEach((args, idx) => {
      const [, set] = setEffectByValidity(...args);
      set({ isValid: Boolean(idx % 2), target: targetElement });
    });
  });

  it('should override default state values', () => {
    const htmlElement1 = document.createElement('div');
    const htmlElement2 = document.createElement('div');
    const defaultStateValues = { true: '1', false: '2' };
    const overridenStateValues = { true: 'one', false: 'two' };
    let effectFnCallCount = 0;

    const effectFn = (element, stateValues, isValid) => {
      if (element === htmlElement1) {
        expect(stateValues).toBe(defaultStateValues);
      }

      if (element === htmlElement2) {
        expect(stateValues).toBe(overridenStateValues);
      }

      expect(isValid).toBe(Boolean(effectFnCallCount++ % 2));
    };

    const setEffectByValidity = createApplyEffect(effectFn, defaultStateValues);

    [
      [htmlElement1], // default
      [defaultStateValues, htmlElement1], // overriden with the default
      [htmlElement2, overridenStateValues],
      [0, htmlElement1], // default
      [overridenStateValues, 0, htmlElement2],
      [htmlElement1, 0], // default
      [htmlElement2, overridenStateValues, 0],
      [0, overridenStateValues, htmlElement2],
      [0, htmlElement2, overridenStateValues],
    ].forEach((args, idx) => {
      const [, set] = setEffectByValidity(...args);
      set({ isValid: Boolean(idx % 2), target: htmlElement2 });
    });
  });

  it('should cancel delayed effects', async () => {
    const htmlElement = document.createElement('div');
    const delay = 10;
    const valuesObjs = {
      0: { true: '1 1', false: '1 0' },
      1: { true: '2 1', false: '2 0' },
      2: { true: '3 1', false: '3 0' },
      3: { true: '4 1', false: '4 0' },
      4: { true: '5 1', false: '5 0' },
      5: { true: '6 1', false: '6 0' },
      6: { true: '7 1', false: '7 0' },
      length: 7,
    };

    const results = [];

    const effectFn = (element, stateValues, isValid) => {
      results.push(Array.prototype.pop.call(stateValues)[isValid]);
    };

    const setEffectByValidity = createApplyEffect(effectFn);

    const [cancel, set] = setEffectByValidity(valuesObjs, delay, htmlElement);

    set({ isValid: true });
    await wait(delay / 2);
    expect(results).toStrictEqual([]);
    await wait(delay / 2);
    expect(results).toStrictEqual(['7 1']);

    // calling the cancel function
    set({ isValid: true });
    await wait(delay / 2);
    expect(results).toStrictEqual(['7 1']);
    cancel();
    await wait(delay / 2);
    expect(results).toStrictEqual(['7 1']);

    set({ isValid: false });
    await wait(delay / 2);
    expect(results).toStrictEqual(['7 1']);
    await wait(delay / 2);
    expect(results).toStrictEqual(['7 1', '6 0']);

    set({ isValid: false });
    await wait(delay / 2);
    expect(results).toStrictEqual(['7 1', '6 0']);
    await wait(delay / 2);
    expect(results).toStrictEqual(['7 1', '6 0', '5 0']);

    // repetetive calls of the set function
    set({ isValid: false });
    await wait(delay / 2);
    set({ isValid: false });
    await wait(delay / 2);
    set({ isValid: false });
    await wait(delay / 2);
    set({ isValid: true });
    await wait(delay / 2);
    expect(results).toStrictEqual(['7 1', '6 0', '5 0']);
    await wait(delay / 2);
    expect(results).toStrictEqual(['7 1', '6 0', '5 0', '4 1']);

    set({ isValid: false });
    await wait(delay / 2);
    expect(results).toStrictEqual(['7 1', '6 0', '5 0', '4 1']);
    await wait(delay / 2);
    expect(results).toStrictEqual(['7 1', '6 0', '5 0', '4 1', '3 0']);

    // calling the cancel function
    set({ isValid: true });
    await wait(delay / 2);
    expect(results).toStrictEqual(['7 1', '6 0', '5 0', '4 1', '3 0']);
    cancel();
    await wait(delay / 2);
    expect(results).toStrictEqual(['7 1', '6 0', '5 0', '4 1', '3 0']);

    // repetetive calls of the set function and then calling the cancel function
    set({ isValid: true });
    await wait(delay / 2);
    expect(results).toStrictEqual(['7 1', '6 0', '5 0', '4 1', '3 0']);
    set({ isValid: false });
    await wait(delay / 2);
    expect(results).toStrictEqual(['7 1', '6 0', '5 0', '4 1', '3 0']);
    set({ isValid: true });
    await wait(delay / 2);
    expect(results).toStrictEqual(['7 1', '6 0', '5 0', '4 1', '3 0']);
    cancel();
    await wait(delay / 2);
    expect(results).toStrictEqual(['7 1', '6 0', '5 0', '4 1', '3 0']);

    set({ isValid: true });
    await wait(delay / 2);
    expect(results).toStrictEqual(['7 1', '6 0', '5 0', '4 1', '3 0']);
    await wait(delay / 2);
    expect(results).toStrictEqual(['7 1', '6 0', '5 0', '4 1', '3 0', '2 1']);

    set({ isValid: false });
    await wait(delay / 2);
    expect(results).toStrictEqual(['7 1', '6 0', '5 0', '4 1', '3 0', '2 1']);
    await wait(delay / 2);
    expect(results).toStrictEqual([
      '7 1',
      '6 0',
      '5 0',
      '4 1',
      '3 0',
      '2 1',
      '1 0',
    ]);
  });
});
