import { expect, jest, it, describe, beforeEach } from '@jest/globals';
import { Validation } from '../../src/index.js';
import {
  isEmail,
  isEmailNotBusy,
  isLongerThan,
  isNotOneTimeEmail,
} from '../predicates.js';
import wait from '../../src/utils/wait.js';

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

  describe('debounce', () => {
    it('should delay running a predicate for a specified amount of time', (done) => {
      const validation = Validation(validatedObj);
      const debounce = 500;

      validation.constraint(syncPredicate, { debounce });

      const interval = setInterval(validation.validate, 200);

      setTimeout(() => {
        clearInterval(interval);

        setTimeout(() => {
          done();
          expect(syncPredicate).toHaveBeenCalledTimes(1);
        }, debounce);
      }, 1200);
    }, 3000);

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
      '$title: should cancel a debounced predicate when the previous with next=false are invalid',
      async ({ clone }) => {
        const email = { value: '' };
        const validation1 = Validation(email);

        const debounce = 300;
        const testValues = [
          'a@a.a',
          'aa@a.a',
          'a@a.',
          'b@b.b',
          'b@bacaki.com',
          'q@q.q',
        ];

        validation1
          .constraint(isEmail, { next: false }) // true true false true  true  true
          .constraint(isNotOneTimeEmail, { next: false }) // true true       true  false true
          .constraint(isLongerThan(1));

        const validation2 = clone ? Validation.clone(validation1) : validation1;

        validation2
          .constraint(isEmailNotBusy, { debounce, next: false }) // true deb.       deb.        false
          .constraint(isLongerThan(4)); // true

        // 1
        [email.value] = testValues;
        expect((await validation2.validate()).isValid).toBe(true);
        expect(validation2.isValid).toBe(true);
        expect(isEmail.mock.calls).toStrictEqual([['a@a.a']]);
        expect(isNotOneTimeEmail.mock.calls).toStrictEqual([['a@a.a']]);
        expect(isEmailNotBusy.mock.calls).toStrictEqual([['a@a.a']]);
        expect(isLongerThan(4).mock.calls).toStrictEqual([['a@a.a']]);
        expect(isEmail).toHaveNthReturnedWith(1, true);
        expect(isNotOneTimeEmail).toHaveNthReturnedWith(1, true);
        expect(isEmailNotBusy).toHaveNthReturnedWith(1, expect.any(Promise));
        expect(isLongerThan(4)).toHaveNthReturnedWith(1, true);

        // 2
        [, email.value] = testValues;
        validation2.validate();
        await wait(100);
        expect(validation2.isValid).toBe(true);
        expect(isEmail.mock.calls).toStrictEqual([['a@a.a'], ['aa@a.a']]);
        expect(isNotOneTimeEmail.mock.calls).toStrictEqual([
          ['a@a.a'],
          ['aa@a.a'],
        ]);
        expect(isEmailNotBusy.mock.calls).toStrictEqual([['a@a.a']]);
        expect(isLongerThan(4).mock.calls).toStrictEqual([['a@a.a']]);
        expect(isEmail).toHaveNthReturnedWith(2, true);
        expect(isNotOneTimeEmail).toHaveNthReturnedWith(2, true);
        await wait(100);
        expect(isEmailNotBusy).toHaveBeenCalledTimes(1); // deferred, not called yet
        expect(isLongerThan(4)).toHaveBeenCalledTimes(1);

        // 3
        [, , email.value] = testValues;
        expect((await validation2.validate()).isValid).toBe(false);
        expect(isEmail.mock.calls).toStrictEqual([
          ['a@a.a'],
          ['aa@a.a'],
          ['a@a.'],
        ]);
        expect(isNotOneTimeEmail.mock.calls).toStrictEqual([
          ['a@a.a'],
          ['aa@a.a'],
        ]);
        expect(isEmailNotBusy.mock.calls).toStrictEqual([['a@a.a']]);
        expect(isLongerThan(4).mock.calls).toStrictEqual([['a@a.a']]);
        expect(isEmail).toHaveNthReturnedWith(3, false);
        expect(isNotOneTimeEmail).toHaveBeenCalledTimes(2);
        await wait(100);
        expect(isEmailNotBusy).toHaveBeenCalledTimes(1); // the deferred call is canceled, since the first predicate is invalid
        expect(isLongerThan(4)).toHaveBeenCalledTimes(1);

        // 4
        [, , , email.value] = testValues;
        validation2.validate();
        await wait(100);
        expect(isEmail.mock.calls).toStrictEqual([
          ['a@a.a'],
          ['aa@a.a'],
          ['a@a.'],
          ['b@b.b'],
        ]);
        expect(isNotOneTimeEmail.mock.calls).toStrictEqual([
          ['a@a.a'],
          ['aa@a.a'],
          ['b@b.b'],
        ]);
        expect(isEmailNotBusy.mock.calls).toStrictEqual([['a@a.a']]);
        expect(isLongerThan(4).mock.calls).toStrictEqual([['a@a.a']]);
        expect(isEmail).toHaveNthReturnedWith(4, true);
        expect(isNotOneTimeEmail).toHaveBeenCalledTimes(3);
        expect(isNotOneTimeEmail).toHaveNthReturnedWith(3, true);
        await wait(100);
        expect(isEmailNotBusy).toHaveBeenCalledTimes(1); // again deferred, not called yet
        expect(isLongerThan(4)).toHaveBeenCalledTimes(1);

        // 5
        [, , , , email.value] = testValues;
        expect((await validation2.validate()).isValid).toBe(false);
        expect(isEmail.mock.calls).toStrictEqual([
          ['a@a.a'],
          ['aa@a.a'],
          ['a@a.'],
          ['b@b.b'],
          ['b@bacaki.com'],
        ]);
        expect(isNotOneTimeEmail.mock.calls).toStrictEqual([
          ['a@a.a'],
          ['aa@a.a'],
          ['b@b.b'],
          ['b@bacaki.com'],
        ]);
        expect(isEmailNotBusy.mock.calls).toStrictEqual([['a@a.a']]);
        expect(isLongerThan(4).mock.calls).toStrictEqual([['a@a.a']]);
        expect(isEmail).toHaveNthReturnedWith(5, true);
        expect(isNotOneTimeEmail).toHaveBeenCalledTimes(4);
        expect(isNotOneTimeEmail).toHaveNthReturnedWith(4, false);
        await wait(100);
        expect(isEmailNotBusy).toHaveBeenCalledTimes(1); // again canceled
        expect(isLongerThan(4)).toHaveBeenCalledTimes(1);

        // 6
        [, , , , , email.value] = testValues;
        expect((await validation2.validate()).isValid).toBe(false);
        expect(isEmail.mock.calls).toStrictEqual([
          ['a@a.a'],
          ['aa@a.a'],
          ['a@a.'],
          ['b@b.b'],
          ['b@bacaki.com'],
          ['q@q.q'],
        ]);
        expect(isNotOneTimeEmail.mock.calls).toStrictEqual([
          ['a@a.a'],
          ['aa@a.a'],
          ['b@b.b'],
          ['b@bacaki.com'],
          ['q@q.q'],
        ]);
        expect(isEmailNotBusy.mock.calls).toStrictEqual([['a@a.a'], ['q@q.q']]);
        expect(isLongerThan(4).mock.calls).toStrictEqual([['a@a.a']]);
        expect(isEmail).toHaveNthReturnedWith(6, true);
        expect(isNotOneTimeEmail).toHaveBeenCalledTimes(5);
        expect(isNotOneTimeEmail).toHaveNthReturnedWith(5, true);
        expect(isEmailNotBusy).toHaveBeenCalledTimes(2); // false
        expect(isLongerThan(4)).toHaveBeenCalledTimes(1);
      },
    );
  });
});
