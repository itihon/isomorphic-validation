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
    const valuesObj = {
      true: { delay: 0, value: 't' },
      false: { delay: 0, value: 'f' },
    };
    let effectFnCallCount = 0;

    const effectFn = (element, stateValues, { isValid }) => {
      expect(element).toBe(htmlElement);
      expect(stateValues).toStrictEqual(valuesObj);

      expect(isValid).toBe(Boolean(effectFnCallCount++ % 2));
    };

    const applyEffect = createApplyEffect(effectFn);

    [
      [htmlElement, valuesObj],
      [valuesObj, htmlElement],
      [valuesObj, htmlElement],
      [htmlElement, valuesObj],
      [valuesObj, htmlElement],
      [htmlElement, valuesObj],
      [valuesObj, htmlElement],
      [htmlElement, valuesObj],
    ].forEach((args, idx) => {
      const [, set] = applyEffect(...args);
      set({ isValid: Boolean(idx % 2) });
    });
  });

  it('should override target element with htmlElement', () => {
    const htmlElement = document.createElement('div');
    const targetElement = document.createElement('div');
    const valuesObj1 = { true: '', false: '' };
    const valuesObj2 = { true: '', false: '' };
    let effectFnCallCount = 0;

    const effectFn = (element, stateValues, { isValid }) => {
      if (stateValues === valuesObj1) {
        expect(element).toBe(htmlElement);
      }

      if (stateValues === valuesObj2) {
        expect(element).toBe(targetElement);
      }

      expect(isValid).toBe(Boolean(effectFnCallCount++ % 2));
    };

    const applyEffect = createApplyEffect(effectFn);

    [
      [htmlElement, valuesObj1],
      [valuesObj2],
      [valuesObj1, htmlElement],
      [valuesObj2],
      [valuesObj1, htmlElement],
      [htmlElement, valuesObj1],
      [valuesObj2],
      [htmlElement, valuesObj1],
    ].forEach((args, idx) => {
      const [, set] = applyEffect(...args);
      set({ isValid: Boolean(idx % 2), target: targetElement });
    });
  });

  it('should override default state values', () => {
    const htmlElement1 = document.createElement('div');
    const htmlElement2 = document.createElement('div');
    const defaultStateValues = { true: { value: '1' }, false: { value: '2' } };
    const overridenStateValues = {
      true: { value: 'one' },
      false: { value: 'two' },
    };
    let effectFnCallCount = 0;

    const effectFn = (element, stateValues, { isValid }) => {
      if (element === htmlElement1) {
        expect(stateValues).toStrictEqual(defaultStateValues);
      }

      if (element === htmlElement2) {
        expect(stateValues).toStrictEqual(overridenStateValues);
      }

      expect(isValid).toBe(Boolean(effectFnCallCount++ % 2));
    };

    const applyEffect = createApplyEffect(effectFn, defaultStateValues);

    [
      [htmlElement1], // default
      [defaultStateValues, htmlElement1], // overriden with the default
      [htmlElement2, overridenStateValues],
      [htmlElement1], // default
      [overridenStateValues, htmlElement2],
      [htmlElement1], // default
      [htmlElement2, overridenStateValues],
      [overridenStateValues, htmlElement2],
      [htmlElement2, overridenStateValues],
    ].forEach((args, idx) => {
      const [, set] = applyEffect(...args);
      set({ isValid: Boolean(idx % 2), target: htmlElement2 });
    });
  });

  it('should cancel delayed effects', async () => {
    const htmlElement = document.createElement('div');
    const delay = 10;
    const valuesObj = {
      true: {
        delay,
        value: ['1 1', '2 1', '3 1', '4 1', '5 1', '6 1', '7 1'],
      },
      false: {
        delay,
        value: ['1 0', '2 0', '3 0', '4 0', '5 0', '6 0', '7 0'],
      },
    };

    const results = [];

    const effectFn = (element, stateValues, { isValid }) => {
      results.push(stateValues[isValid].value.pop());
      stateValues[!isValid].value.pop();
    };

    const applyEffect = createApplyEffect(effectFn);

    const [cancel, set] = applyEffect(valuesObj, htmlElement);

    set({ isValid: true });
    await wait(delay / 2);
    expect(results).toStrictEqual([]);
    await wait(delay / 2);
    expect(results).toStrictEqual(['7 1']);

    // calling the cancel function
    set({ isValid: true });
    await wait(delay / 2);
    expect(results).toStrictEqual(['7 1']);
    cancel({ target: htmlElement });
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
    cancel({ target: htmlElement });
    await wait(delay / 2);
    expect(results).toStrictEqual(['7 1', '6 0', '5 0', '4 1', '3 0']);

    expect(results).toStrictEqual(['7 1', '6 0', '5 0', '4 1', '3 0']);
    set({ isValid: true });
    await wait(delay / 2);
    expect(results).toStrictEqual(['7 1', '6 0', '5 0', '4 1', '3 0']);
    cancel({ target: htmlElement });
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

  it('should cancel delayed effects for a ceratain target', async () => {
    const htmlElement1 = document.createElement('div');
    const htmlElement2 = document.createElement('div');
    const delay1 = 10;
    const delay2 = 20;
    const valuesObj = {
      true: {
        delay: delay1,
        value: ['1 1', '2 1', '3 1', '4 1', '5 1', '6 1', '7 1'],
      },
      false: {
        delay: delay2,
        value: ['1 0', '2 0', '3 0', '4 0', '5 0', '6 0', '7 0'],
      },
    };

    const results = [];

    const effectFn = (element, stateValues, { isValid }) => {
      results.push(stateValues[isValid].value.pop());
      stateValues[!isValid].value.pop();
      expect(element).toBe(isValid ? htmlElement1 : htmlElement2);
    };

    const applyEffect = createApplyEffect(effectFn);

    const [cancel, set] = applyEffect(valuesObj);

    set({ isValid: true, target: htmlElement1 });
    await wait(delay1 / 2);
    expect(results).toStrictEqual([]);
    await wait(delay1 / 2);
    expect(results).toStrictEqual(['7 1']);

    // calling the cancel function
    set({ isValid: true, target: htmlElement1 });
    await wait(delay1 / 2);
    expect(results).toStrictEqual(['7 1']);
    cancel({ target: htmlElement1 });
    await wait(delay1 / 2);
    expect(results).toStrictEqual(['7 1']);

    set({ isValid: false, target: htmlElement2 });
    await wait(delay2 / 2);
    expect(results).toStrictEqual(['7 1']);
    await wait(delay2 / 2);
    expect(results).toStrictEqual(['7 1', '6 0']);

    set({ isValid: false, target: htmlElement2 });
    await wait(delay2 / 2);
    expect(results).toStrictEqual(['7 1', '6 0']);
    await wait(delay2 / 2);
    expect(results).toStrictEqual(['7 1', '6 0', '5 0']);

    set({ isValid: false, target: htmlElement2 });
    await wait(delay2 / 2);
    expect(results).toStrictEqual(['7 1', '6 0', '5 0']);
    await wait(delay2 / 2);
    expect(results).toStrictEqual(['7 1', '6 0', '5 0', '4 0']);

    set({ isValid: true, target: htmlElement1 });
    await wait(delay1 / 2);
    expect(results).toStrictEqual(['7 1', '6 0', '5 0', '4 0']);
    await wait(delay1 / 2);
    expect(results).toStrictEqual(['7 1', '6 0', '5 0', '4 0', '3 1']);

    set({ isValid: false, target: htmlElement2 });
    await wait(delay2 / 2);
    expect(results).toStrictEqual(['7 1', '6 0', '5 0', '4 0', '3 1']);
    await wait(delay2 / 2);
    expect(results).toStrictEqual(['7 1', '6 0', '5 0', '4 0', '3 1', '2 0']);

    // calling the cancel function
    set({ isValid: true, target: htmlElement1 });
    await wait(delay1 / 2);
    expect(results).toStrictEqual(['7 1', '6 0', '5 0', '4 0', '3 1', '2 0']);
    cancel({ target: htmlElement1 });
    await wait(delay1 / 2);
    expect(results).toStrictEqual(['7 1', '6 0', '5 0', '4 0', '3 1', '2 0']);

    // repetetive calls of the set function and then calling the cancel function
    set({ isValid: true, target: htmlElement1 });
    await wait(delay1 / 2);
    expect(results).toStrictEqual(['7 1', '6 0', '5 0', '4 0', '3 1', '2 0']);
    set({ isValid: false, target: htmlElement2 });
    await wait(delay2 / 2);
    expect(results).toStrictEqual([
      '7 1',
      '6 0',
      '5 0',
      '4 0',
      '3 1',
      '2 0',
      '1 1',
    ]);
    set({ isValid: true, target: htmlElement1 });
    await wait(delay1 / 2);
    expect(results).toStrictEqual([
      '7 1',
      '6 0',
      '5 0',
      '4 0',
      '3 1',
      '2 0',
      '1 1',
    ]);
    cancel({ target: htmlElement1 });
    cancel({ target: htmlElement2 });
    await wait(delay1 + delay2);
    expect(results).toStrictEqual([
      '7 1',
      '6 0',
      '5 0',
      '4 0',
      '3 1',
      '2 0',
      '1 1',
    ]);

    set({ isValid: true, target: htmlElement1 });
    await wait(delay1 / 2);
    expect(results).toStrictEqual([
      '7 1',
      '6 0',
      '5 0',
      '4 0',
      '3 1',
      '2 0',
      '1 1',
    ]);
    cancel({ target: htmlElement1 });
    await wait(delay1 / 2);
    expect(results).toStrictEqual([
      '7 1',
      '6 0',
      '5 0',
      '4 0',
      '3 1',
      '2 0',
      '1 1',
    ]);

    set({ isValid: false, target: htmlElement2 });
    await wait(delay2 / 2);
    expect(results).toStrictEqual([
      '7 1',
      '6 0',
      '5 0',
      '4 0',
      '3 1',
      '2 0',
      '1 1',
    ]);
    cancel({ target: htmlElement2 });
    await wait(delay2);
    expect(results).toStrictEqual([
      '7 1',
      '6 0',
      '5 0',
      '4 0',
      '3 1',
      '2 0',
      '1 1',
    ]);
  });

  it.todo('should log a warning if the target element is not set');
});
