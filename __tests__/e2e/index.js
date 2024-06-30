import { expect, jest, it, describe } from '@jest/globals';
import { Validation } from '../../src/index.js';

describe('e2e', () => {
  it.todo(
    'valid, invalid, changed etc. accept only functions and ignore anything else',
  );

  it('is imposible to start an async predicate unless the previously launched is not finished', (done) => {
    const syncPredicate = jest.fn((value) => value === 42);
    const asyncPredicate = jest.fn(
      (value) =>
        new Promise((res) => {
          setTimeout(res, 1000, value === 42);
        }),
    );

    const validatedObj = {
      value: 42,
    };

    const testAsyncValidation = Validation(validatedObj);
    testAsyncValidation.constraint(syncPredicate).constraint(asyncPredicate);

    const interval = setInterval(testAsyncValidation.validate, 200);

    setTimeout(() => {
      clearInterval(interval);
      done();

      expect(syncPredicate).toHaveBeenCalledTimes(5);
      expect(asyncPredicate).toHaveBeenCalledTimes(1);
    }, 1200);
  }, 2000);

  it('keepValid', async () => {
    const isTens = jest.fn(
      (value) => Number(value) !== 0 && Number(value) % 10 === 0,
    );

    const validCB = jest.fn();
    const invalidCB = jest.fn();
    const changedCB = jest.fn();

    const validatedObj = {
      value: 42,
    };

    const initVal = '';

    const testValidation = Validation(validatedObj, 'value', initVal);
    testValidation
      .constraint(isTens, { keepValid: true })
      .valid(validCB)
      .invalid(invalidCB)
      .changed(changedCB);

    expect((await testValidation.validate()).isValid).toBe(false);
    expect(validatedObj.value).toBe(initVal);
    expect(validCB).toHaveBeenCalledTimes(0);
    expect(invalidCB).toHaveBeenCalledTimes(1);
    expect(changedCB).toHaveBeenCalledTimes(0);

    validatedObj.value = 40;
    expect((await testValidation.validate()).isValid).toBe(true);
    expect(validatedObj.value).toBe(40);
    expect(validCB).toHaveBeenCalledTimes(1);
    expect(invalidCB).toHaveBeenCalledTimes(1);
    expect(changedCB).toHaveBeenCalledTimes(1);

    validatedObj.value = 1;
    expect((await testValidation.validate()).isValid).toBe(true);
    expect(validatedObj.value).toBe(40);
    expect(validCB).toHaveBeenCalledTimes(2);
    expect(invalidCB).toHaveBeenCalledTimes(1);
    expect(changedCB).toHaveBeenCalledTimes(1);

    validatedObj.value = 50;
    expect((await testValidation.validate()).isValid).toBe(true);
    expect(validatedObj.value).toBe(50);
    expect(validCB).toHaveBeenCalledTimes(3);
    expect(invalidCB).toHaveBeenCalledTimes(1);
    expect(changedCB).toHaveBeenCalledTimes(1);

    validatedObj.value = -43;
    expect((await testValidation.validate()).isValid).toBe(true);
    expect(validatedObj.value).toBe(50);
    expect(validCB).toHaveBeenCalledTimes(4);
    expect(invalidCB).toHaveBeenCalledTimes(1);
    expect(changedCB).toHaveBeenCalledTimes(1);

    validatedObj.value = -4;
    expect((await testValidation.validate()).isValid).toBe(true);
    expect(validatedObj.value).toBe(50);
    expect(validCB).toHaveBeenCalledTimes(5);
    expect(invalidCB).toHaveBeenCalledTimes(1);
    expect(changedCB).toHaveBeenCalledTimes(1);

    validatedObj.value = initVal;
    expect((await testValidation.validate()).isValid).toBe(false);
    expect(validatedObj.value).toBe(initVal);
    expect(validCB).toHaveBeenCalledTimes(5);
    expect(invalidCB).toHaveBeenCalledTimes(2);
    expect(changedCB).toHaveBeenCalledTimes(2);
  });
});
