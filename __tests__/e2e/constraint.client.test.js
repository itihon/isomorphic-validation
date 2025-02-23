/**
 * @jest-environment jsdom
 */
import { expect, it, describe, jest, beforeEach } from '@jest/globals';
import { Validation } from '../../src/index.js';
import {
  isEmail,
  isEmailNotBusy,
  isLongerThan,
  isNotOneTimeEmail,
} from '../predicates.js';
import wait from '../../src/utils/wait.js';

const validatedObj = {
  value: 42,
};

const syncPredicate = jest.fn((value) => value === 42);

describe('debounce', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    validatedObj.value = 42;
  });

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

  it('should discard the execution result of a previous async predicate', async () => {
    const validatableObject = { value: '' };
    const debounce = 100;
    const latency = 100;
    const isMeaningOfLifeAsync = jest.fn(
      (value) =>
        new Promise((resolve) => {
          setTimeout(resolve, latency, value === '42');
        }),
    );

    const validation = Validation(validatableObject).constraint(
      isMeaningOfLifeAsync,
      { debounce },
    );

    validatableObject.value = '42';
    validation.validate();
    expect(isMeaningOfLifeAsync).toHaveBeenCalledTimes(0);

    await wait(debounce);
    expect(isMeaningOfLifeAsync).toHaveBeenCalledTimes(1);
    expect(validation.isValid).toBe(false);

    await wait(latency);
    expect(validation.isValid).toBe(true);

    validatableObject.value = '43';
    validation.validate();
    expect(isMeaningOfLifeAsync).toHaveBeenCalledTimes(1);

    await wait(debounce);
    expect(isMeaningOfLifeAsync).toHaveBeenCalledTimes(2);
    expect(validation.isValid).toBe(true);

    await wait(latency);
    expect(validation.isValid).toBe(false);

    validatableObject.value = '42';
    validation.validate();
    expect(isMeaningOfLifeAsync).toHaveBeenCalledTimes(2);

    await wait(debounce);
    expect(isMeaningOfLifeAsync).toHaveBeenCalledTimes(3);
    expect(validation.isValid).toBe(false);

    await wait(latency / 2);
    expect(validation.isValid).toBe(false);

    validatableObject.value = '43';
    validation.validate();
    expect(isMeaningOfLifeAsync).toHaveBeenCalledTimes(3);

    await wait(debounce / 2);
    expect(validation.isValid).toBe(false);
    expect(isMeaningOfLifeAsync).toHaveBeenCalledTimes(3);

    await wait(debounce / 2);
    expect(validation.isValid).toBe(false);
    expect(isMeaningOfLifeAsync).toHaveBeenCalledTimes(4);

    validatableObject.value = '42';
    validation.validate();
    expect(isMeaningOfLifeAsync).toHaveBeenCalledTimes(4);

    await wait(debounce / 2);
    expect(validation.isValid).toBe(false);
    expect(isMeaningOfLifeAsync).toHaveBeenCalledTimes(4);

    await wait(debounce / 2);
    expect(validation.isValid).toBe(false);
    expect(isMeaningOfLifeAsync).toHaveBeenCalledTimes(5);

    await wait(latency / 2);
    expect(validation.isValid).toBe(false);
    expect(isMeaningOfLifeAsync).toHaveBeenCalledTimes(5);

    validatableObject.value = '43';
    validation.validate();
    expect(isMeaningOfLifeAsync).toHaveBeenCalledTimes(5);

    await wait(debounce / 2);
    expect(validation.isValid).toBe(false);
    expect(isMeaningOfLifeAsync).toHaveBeenCalledTimes(5);

    await wait(debounce / 2);
    expect(validation.isValid).toBe(false);
    expect(isMeaningOfLifeAsync).toHaveBeenCalledTimes(6);

    await wait(latency / 2);
    expect(validation.isValid).toBe(false);
    expect(isMeaningOfLifeAsync).toHaveBeenCalledTimes(6);

    await wait(latency / 2);
    expect(validation.isValid).toBe(false);
    expect(isMeaningOfLifeAsync).toHaveBeenCalledTimes(6);

    // last time just in case
    await wait(latency);
    expect(validation.isValid).toBe(false);
    expect(isMeaningOfLifeAsync).toHaveBeenCalledTimes(6);
  });
});
