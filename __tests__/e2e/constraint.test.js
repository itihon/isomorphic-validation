import { expect, jest, it, describe, beforeEach } from '@jest/globals';
import { Predicate, Validation } from '../../src/index.js';
import { isEmail, isEmailNotBusy, isNotOneTimeEmail } from '../predicates.js';

const validatedObj = {
  value: 42,
};

describe('e2e', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    validatedObj.value = 42;
  });

  it('should accept only function or Predicate, otherwise throw an error', () => {
    const errMsg = 'Neither a function nor a Predicate was passed in.';

    expect(() => Validation().constraint()).toThrowError(errMsg);
    expect(() => Validation().constraint(null)).toThrowError(errMsg);
    expect(() => Validation().constraint([])).toThrowError(errMsg);
    expect(() => Validation().constraint({})).toThrowError(errMsg);
    expect(() => Validation().constraint('')).toThrowError(errMsg);

    expect(() => Validation().constraint(() => true)).not.toThrow();
    expect(() => Validation().constraint(Predicate(() => true))).not.toThrow();

    expect(() =>
      Validation().constraint(Predicate(() => true).server.valid(() => {})),
    ).not.toThrow();

    expect(() =>
      Validation().constraint(Predicate(() => true).client.valid(() => {})),
    ).not.toThrow();

    expect(() =>
      Validation().constraint(
        Predicate(() => true).server.valid(() => {}).client,
      ),
    ).not.toThrow();

    expect(() =>
      Validation().constraint(
        Predicate(() => true).client.valid(() => {}).server,
      ),
    ).not.toThrow();
  });

  it('keepValid', async () => {
    const isTens = jest.fn(
      (value) => Number(value) !== 0 && Number(value) % 10 === 0,
    );

    const startedCB = jest.fn();
    const validCB = jest.fn();
    const invalidCB = jest.fn();
    const changedCB = jest.fn();

    const predicateStartedCB = jest.fn();
    const predicateValidCB = jest.fn();
    const predicateInvalidCB = jest.fn();
    const predicateChangedCB = jest.fn();
    const predicateRestoredCB = jest.fn();

    const initValue = 0;

    const testValidation = Validation(validatedObj, {
      path: 'value',
      initValue,
    });

    testValidation
      .constraint(
        Predicate(isTens)
          .started(predicateStartedCB)
          .valid(predicateValidCB)
          .invalid(predicateInvalidCB)
          .changed(predicateChangedCB)
          .restored(predicateRestoredCB),
        { keepValid: true },
      )
      .started(startedCB)
      .valid(validCB)
      .invalid(invalidCB)
      .changed(changedCB);

    validatedObj.value = initValue;
    expect((await testValidation.validate()).isValid).toBe(false);
    expect(validatedObj.value).toBe(initValue);
    expect(startedCB).toHaveBeenCalledTimes(1);
    expect(validCB).toHaveBeenCalledTimes(0);
    expect(invalidCB).toHaveBeenCalledTimes(1);
    expect(changedCB).toHaveBeenCalledTimes(0);
    expect(predicateStartedCB).toHaveBeenCalledTimes(1);
    expect(predicateValidCB).toHaveBeenCalledTimes(0);
    expect(predicateInvalidCB).toHaveBeenCalledTimes(1);
    expect(predicateChangedCB).toHaveBeenCalledTimes(0);
    expect(predicateRestoredCB).toHaveBeenCalledTimes(1);

    validatedObj.value = 40;
    expect((await testValidation.validate()).isValid).toBe(true);
    expect(validatedObj.value).toBe(40);
    expect(startedCB).toHaveBeenCalledTimes(2);
    expect(validCB).toHaveBeenCalledTimes(1);
    expect(invalidCB).toHaveBeenCalledTimes(1);
    expect(changedCB).toHaveBeenCalledTimes(1);
    expect(predicateStartedCB).toHaveBeenCalledTimes(2);
    expect(predicateValidCB).toHaveBeenCalledTimes(1);
    expect(predicateInvalidCB).toHaveBeenCalledTimes(1);
    expect(predicateChangedCB).toHaveBeenCalledTimes(1);
    expect(predicateRestoredCB).toHaveBeenCalledTimes(1);

    validatedObj.value = 1;
    expect((await testValidation.validate()).isValid).toBe(true);
    expect(validatedObj.value).toBe(40);
    expect(startedCB).toHaveBeenCalledTimes(3);
    expect(validCB).toHaveBeenCalledTimes(2);
    expect(invalidCB).toHaveBeenCalledTimes(1);
    expect(changedCB).toHaveBeenCalledTimes(3); // !!called twice
    expect(predicateStartedCB).toHaveBeenCalledTimes(3);
    expect(predicateValidCB).toHaveBeenCalledTimes(2);
    expect(predicateInvalidCB).toHaveBeenCalledTimes(1);
    expect(predicateChangedCB).toHaveBeenCalledTimes(3); // !!called twice
    expect(predicateRestoredCB).toHaveBeenCalledTimes(2);

    validatedObj.value = 50;
    expect((await testValidation.validate()).isValid).toBe(true);
    expect(validatedObj.value).toBe(50);
    expect(startedCB).toHaveBeenCalledTimes(4);
    expect(validCB).toHaveBeenCalledTimes(3);
    expect(invalidCB).toHaveBeenCalledTimes(1);
    expect(changedCB).toHaveBeenCalledTimes(3);
    expect(predicateStartedCB).toHaveBeenCalledTimes(4);
    expect(predicateValidCB).toHaveBeenCalledTimes(3);
    expect(predicateInvalidCB).toHaveBeenCalledTimes(1);
    expect(predicateChangedCB).toHaveBeenCalledTimes(3);
    expect(predicateRestoredCB).toHaveBeenCalledTimes(2);

    validatedObj.value = -43;
    expect((await testValidation.validate()).isValid).toBe(true);
    expect(validatedObj.value).toBe(50);
    expect(startedCB).toHaveBeenCalledTimes(5);
    expect(validCB).toHaveBeenCalledTimes(4);
    expect(invalidCB).toHaveBeenCalledTimes(1);
    expect(changedCB).toHaveBeenCalledTimes(5); // !!called twice
    expect(predicateStartedCB).toHaveBeenCalledTimes(5);
    expect(predicateValidCB).toHaveBeenCalledTimes(4);
    expect(predicateInvalidCB).toHaveBeenCalledTimes(1);
    expect(predicateChangedCB).toHaveBeenCalledTimes(5); // !!called twice
    expect(predicateRestoredCB).toHaveBeenCalledTimes(3);

    validatedObj.value = -4;
    expect((await testValidation.validate()).isValid).toBe(true);
    expect(validatedObj.value).toBe(50);
    expect(startedCB).toHaveBeenCalledTimes(6);
    expect(validCB).toHaveBeenCalledTimes(5);
    expect(invalidCB).toHaveBeenCalledTimes(1);
    expect(changedCB).toHaveBeenCalledTimes(7); // !!called twice
    expect(predicateStartedCB).toHaveBeenCalledTimes(6);
    expect(predicateValidCB).toHaveBeenCalledTimes(5);
    expect(predicateInvalidCB).toHaveBeenCalledTimes(1);
    expect(predicateChangedCB).toHaveBeenCalledTimes(7); // !!called twice
    expect(predicateRestoredCB).toHaveBeenCalledTimes(4);

    validatedObj.value = initValue;
    expect((await testValidation.validate()).isValid).toBe(false);
    expect(validatedObj.value).toBe(initValue);
    expect(startedCB).toHaveBeenCalledTimes(7);
    expect(validCB).toHaveBeenCalledTimes(5);
    expect(invalidCB).toHaveBeenCalledTimes(2);
    expect(changedCB).toHaveBeenCalledTimes(8); // called once
    expect(predicateStartedCB).toHaveBeenCalledTimes(7);
    expect(predicateValidCB).toHaveBeenCalledTimes(5);
    expect(predicateInvalidCB).toHaveBeenCalledTimes(2);
    expect(predicateChangedCB).toHaveBeenCalledTimes(8); // called once
    expect(predicateRestoredCB).toHaveBeenCalledTimes(5);
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

  describe('anyData', () => {
    it('should throw an error if anyData names clash with Predicate API', () => {
      const v = Validation();
      const getAllPropNames = (obj, acc = new Set()) => {
        if (!obj) {
          return acc;
        }

        const addToAcc = acc.add.bind(acc);

        Object.getOwnPropertyNames(obj).forEach(addToAcc);
        Object.getOwnPropertySymbols(obj).forEach(addToAcc);
        getAllPropNames(Object.getPrototypeOf(obj), acc).forEach(addToAcc);

        return acc;
      };

      const [...propNames] = getAllPropNames(Predicate(() => true));

      propNames.forEach((propName) => {
        expect(() => v.constraint(() => true, { [propName]: '' })).toThrow();
      });

      expect(() => v.constraint(() => true, { foo: 'foo' })).not.toThrow();
    });

    it.each([
      { mode: 'predicate' },
      { mode: 'constraint' },
      { mode: 'override' },
    ])('$mode: should pass anyData to validation result', async ({ mode }) => {
      const v = Validation();
      const predicateFoo = () => true;
      const predicateBar = () => true;

      const validatedCB = (res) => {
        res.forEach((validator) => {
          const name = validator[Symbol.toStringTag].slice(9);
          expect(validator[`msg${name}`]).toBe(name.toLowerCase());
        });
      };

      if (mode === 'predicate') {
        v.constraint(Predicate(predicateFoo, { msgFoo: 'foo' }));
        v.constraint(Predicate(predicateBar, { msgBar: 'bar' }));
      }

      if (mode === 'constraint') {
        v.constraint(predicateFoo, { msgFoo: 'foo' });
        v.constraint(predicateBar, { msgBar: 'bar' });
      }

      if (mode === 'override') {
        const pFoo = Predicate(predicateFoo, { msgFoo: 'qux' });
        const pBar = Predicate(predicateBar, { msgBar: 'baz' });

        v.constraint(pFoo, { msgFoo: 'foo' });
        v.constraint(pBar, { msgBar: 'bar' });
      }

      v.validated(validatedCB);

      await v.validate();
    });

    it.each([
      { mode: 'predicate' },
      { mode: 'constraint' },
      { mode: 'override' },
    ])(
      '$mode: should be accessible in the constraints property',
      async ({ mode }) => {
        const v = Validation();
        const predicateFoo = () => true;
        const predicateBar = () => true;

        if (mode === 'predicate') {
          v.constraint(Predicate(predicateFoo, { msgFoo: 'foo' }));
          v.constraint(Predicate(predicateBar, { msgBar: 'bar' }));
        }

        if (mode === 'constraint') {
          v.constraint(predicateFoo, { msgFoo: 'foo' });
          v.constraint(predicateBar, { msgBar: 'bar' });
        }

        if (mode === 'override') {
          const pFoo = Predicate(predicateFoo, { msgFoo: 'qux' });
          const pBar = Predicate(predicateBar, { msgBar: 'baz' });

          v.constraint(pFoo, { msgFoo: 'foo' });
          v.constraint(pBar, { msgBar: 'bar' });
        }

        v.constraints.forEach((validator) => {
          const name = validator[Symbol.toStringTag].slice(9);
          expect(validator[`msg${name}`]).toBe(name.toLowerCase());
        });
      },
    );
  });
});
