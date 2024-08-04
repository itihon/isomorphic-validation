import { expect, jest, it, describe, beforeEach } from '@jest/globals';
import { Validation } from '../../src/index.js';
import { isEmail, isEmailNotBusy, isNotOneTimeEmail } from '../predicates.js';

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

describe('e2e', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    validatedObj.value = 42;
  });

  it.todo(
    'valid, invalid, changed etc. accept only functions and ignore anything else',
  );

  it.todo(
    'newly created Validation is valid, when predicates are added becomes invalid',
  );

  it.todo('first argument for Validation(), what if it is not an object');
  it.todo(
    'first argument for Validation(), what if it does not contain the specified propName',
  );

  // this feature is considered for deprication
  it.skip('is imposible to start an async predicate unless the previously launched is not finished', (done) => {
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

  describe('next', () => {
    it.each([
      {
        title: 'both the same',
        clone: false,
      },
      {
        title: 'the second is the clone of the first',
        clone: true,
      },
    ])(
      '$title: should invoke a deferred predicate with the relevant argument',
      async ({ clone }) => {
        const email = { value: '' };
        const validation1 = Validation(email);

        const testValues = [
          'a@a.a',
          'b@bacaki.com', // isNotOneTimeEmail -> false
          'aa@a.a',
          'a@a.', // isEmail -> false
          'q@q.q', // isEmailNotBusy -> false
          'b@b.b',
          'b@hellomailo.net', // isNotOneTimeEmail -> false
        ];

        const allCalls = testValues.map((value) => [value]);

        validation1
          .constraint(isEmail)
          .constraint(isEmailNotBusy, { next: false });

        const validation2 = clone ? Validation.clone(validation1) : validation1;

        validation2.constraint(isNotOneTimeEmail); // deferred

        const results = testValues.map((value) => {
          email.value = value;
          return validation2.validate();
        });

        expect(
          (await Promise.all(results)).map((res) => res.isValid),
        ).toStrictEqual([true, false, true, false, false, true, false]);

        expect(isEmail.mock.calls).toStrictEqual(allCalls);
        expect(isEmailNotBusy.mock.calls).toStrictEqual(allCalls);

        expect(isNotOneTimeEmail.mock.calls.flat().sort()).toStrictEqual(
          allCalls
            .flat()
            .filter((value) => value !== 'q@q.q')
            .sort(),
        );
      },
    );
  });
});
