import { jest, it, describe, expect, beforeEach } from '@jest/globals';
import { Validation, Predicate } from '../../src/index.js';

const asyncPredicateWithoutError = jest.fn(
  () =>
    new Promise((res) => {
      setTimeout(res, 10, true);
    }),
);

const syncPredicateWithoutError = jest.fn(() => true);

function syncPredicateWithError() {
  throw new Error(syncPredicateWithError.msg);
}
syncPredicateWithError.msg = 'sync predicate error';

function asyncPredicateWithError() {
  return new Promise((_, reject) => {
    setTimeout(reject, 10, new Error(asyncPredicateWithError.msg));
  });
}
asyncPredicateWithError.msg = 'async predicate error';

function vStateCallbackWithError() {
  throw new Error(vStateCallbackWithError.msg);
}
vStateCallbackWithError.msg = 'validation state callback error';

function pStateCallbackWithError() {
  throw new Error(pStateCallbackWithError.msg);
}
pStateCallbackWithError.msg = 'predicate state callback error';

const vCatchFn = jest.fn();

const pCatchFn = jest.fn();

let validation;
let validation1;
let syncPredicate;
let asyncPredicate;

const init = () => {
  validation = Validation().constraint(() => true, { next: false });
  syncPredicate = Predicate(syncPredicateWithoutError);
  asyncPredicate = Predicate(asyncPredicateWithoutError);
  jest.clearAllMocks();
};

const forGroupAndClone = (type, catchGroupError = true) => {
  if (type) {
    validation1 = Validation[type](validation);
    // add error state callback to the grouping validation
    // otherwise the error won't be catched
    if (type !== 'clone' && catchGroupError) validation1.error(vCatchFn);
  } else {
    validation1 = validation;
  }
};

describe.each([
  { type: undefined },
  { type: 'clone' },
  { type: 'group' },
  { type: 'glue' },
])('$type: Validation().error() method', ({ type }) => {
  beforeEach(init);

  it.each([
    // isValid value depends on which phase an error occurs
    { state: 'started', isValid: false },
    { state: 'valid', isValid: true },
    { state: 'invalid', isValid: false, constraint: () => false },
    { state: 'changed', isValid: false },
    { state: 'validated', isValid: true },
  ])(
    '$state: should catch validation state callback errors',
    async ({ state, isValid, constraint }) => {
      validation[state](vStateCallbackWithError).error(vCatchFn);
      validation.constraint(constraint);

      forGroupAndClone(type);

      expect((await validation1.validate()).isValid).toBe(isValid);
      expect(validation1.isValid).toBe(isValid);

      expect(vCatchFn).toHaveBeenCalledTimes(1);
      expect(vCatchFn.mock.calls[0][0].message).toBe(
        vStateCallbackWithError.msg,
      );
    },
  );

  it.each([
    { state: 'started', isValid: false },
    { state: 'valid', isValid: false },
    { state: 'invalid', isValid: false, constraint: () => false },
    { state: 'changed', isValid: false },
    { state: 'validated', isValid: false },
  ])(
    '$state: should catch predicate state callback errors',
    async ({ state, isValid, constraint }) => {
      if (constraint)
        syncPredicateWithoutError.mockImplementationOnce(constraint);
      syncPredicate[state](pStateCallbackWithError);
      validation.constraint(syncPredicate).error(vCatchFn);

      forGroupAndClone(type);

      expect((await validation1.validate()).isValid).toBe(isValid);
      expect(validation1.isValid).toBe(isValid);

      expect(vCatchFn).toHaveBeenCalledTimes(1);
      expect(vCatchFn.mock.calls[0][0].message).toBe(
        pStateCallbackWithError.msg,
      );
    },
  );

  it('should catch async predicate errors', async () => {
    validation.constraint(Predicate(asyncPredicateWithError)).error(vCatchFn);

    forGroupAndClone(type);

    expect((await validation1.validate()).isValid).toBe(false);

    expect(vCatchFn).toHaveBeenCalledTimes(1);
    expect(vCatchFn.mock.calls[0][0].message).toBe(asyncPredicateWithError.msg);
  });

  it('should catch sync predicate errors', async () => {
    validation.constraint(Predicate(syncPredicateWithError)).error(vCatchFn);

    forGroupAndClone(type);

    expect((await validation1.validate()).isValid).toBe(false);

    expect(vCatchFn).toHaveBeenCalledTimes(1);
    expect(vCatchFn.mock.calls[0][0].message).toBe(syncPredicateWithError.msg);
  });
});

describe.each([
  { type: undefined },
  { type: 'clone' },
  { type: 'group' },
  { type: 'glue' },
])(
  '$type: Validation().validate().catch() method of the returned Promise',
  ({ type }) => {
    beforeEach(init);

    it.each([
      // isValid value depends on which phase an error occurs
      { state: 'started', isValid: false },
      { state: 'valid', isValid: true },
      { state: 'invalid', isValid: false, constraint: () => false },
      { state: 'changed', isValid: false },
      { state: 'validated', isValid: true },
    ])(
      '$state: should catch validation state callback errors',
      async ({ state, isValid, constraint }) => {
        validation.constraint(constraint);
        validation[state](vStateCallbackWithError);

        forGroupAndClone(type);

        await validation1.validate().catch(vCatchFn);
        expect(validation1.isValid).toBe(isValid);

        expect(vCatchFn).toHaveBeenCalledTimes(1);
        expect(vCatchFn.mock.calls[0][0].message).toBe(
          vStateCallbackWithError.msg,
        );
      },
    );

    it.each([
      { state: 'started', isValid: false },
      { state: 'valid', isValid: false },
      { state: 'invalid', isValid: false, constraint: () => false },
      { state: 'changed', isValid: false },
      { state: 'validated', isValid: false },
    ])(
      '$state: should catch predicate state callback errors',
      async ({ state, isValid, constraint }) => {
        if (constraint)
          syncPredicateWithoutError.mockImplementationOnce(constraint);
        syncPredicate[state](pStateCallbackWithError);
        validation.constraint(syncPredicate);

        forGroupAndClone(type);

        await validation1.validate().catch(vCatchFn);
        expect(validation1.isValid).toBe(isValid);

        expect(vCatchFn).toHaveBeenCalledTimes(1);
        expect(vCatchFn.mock.calls[0][0].message).toBe(
          pStateCallbackWithError.msg,
        );
      },
    );

    it('should catch async predicate errors', async () => {
      validation.constraint(Predicate(asyncPredicateWithError));

      forGroupAndClone(type);

      await validation1.validate().catch(vCatchFn);

      expect(vCatchFn).toHaveBeenCalledTimes(1);
      expect(vCatchFn.mock.calls[0][0].message).toBe(
        asyncPredicateWithError.msg,
      );
    });

    it('should catch sync predicate errors', async () => {
      validation.constraint(Predicate(syncPredicateWithError));

      forGroupAndClone(type);

      await validation1.validate().catch(vCatchFn);

      expect(vCatchFn).toHaveBeenCalledTimes(1);
      expect(vCatchFn.mock.calls[0][0].message).toBe(
        syncPredicateWithError.msg,
      );
    });
  },
);

describe.each([
  { type: undefined },
  { type: 'clone' },
  { type: 'group' },
  { type: 'glue' },
])('$type: Predicate().error() method', ({ type }) => {
  beforeEach(init);

  it.each([
    { state: 'started', isValid: false },
    { state: 'valid', isValid: false },
    { state: 'invalid', isValid: false, constraint: () => false },
    { state: 'changed', isValid: false },
    { state: 'validated', isValid: false },
  ])(
    "$state: should catch sync predicate's state callback errors",
    async ({ state, isValid, constraint }) => {
      if (constraint)
        syncPredicateWithoutError.mockImplementationOnce(constraint);
      syncPredicate[state](pStateCallbackWithError).error(pCatchFn);
      validation.constraint(syncPredicate);

      forGroupAndClone(type);

      expect((await validation1.validate()).isValid).toBe(isValid);

      expect(pCatchFn).toHaveBeenCalledTimes(1);
      expect(pCatchFn.mock.calls[0][0].message).toBe(
        pStateCallbackWithError.msg,
      );
    },
  );

  it.each([
    { state: 'started', isValid: false },
    { state: 'valid', isValid: false },
    { state: 'invalid', isValid: false, constraint: () => false },
    { state: 'changed', isValid: false },
    { state: 'validated', isValid: false },
  ])(
    "$state: should catch async predicate's state callback errors",
    async ({ state, isValid, constraint }) => {
      if (constraint)
        asyncPredicateWithoutError.mockImplementationOnce(constraint);
      asyncPredicate[state](pStateCallbackWithError).error(pCatchFn);
      validation.constraint(asyncPredicate);

      forGroupAndClone(type);

      expect((await validation1.validate()).isValid).toBe(isValid);

      expect(pCatchFn).toHaveBeenCalledTimes(1);
      expect(pCatchFn.mock.calls[0][0].message).toBe(
        pStateCallbackWithError.msg,
      );
    },
  );

  it('should catch async predicate errors', async () => {
    validation.constraint(Predicate(asyncPredicateWithError).error(pCatchFn));

    forGroupAndClone(type);

    expect((await validation.validate()).isValid).toBe(false);

    expect(pCatchFn).toHaveBeenCalledTimes(1);
    expect(pCatchFn.mock.calls[0][0].message).toBe(asyncPredicateWithError.msg);
  });

  it('should catch sync predicate errors', async () => {
    validation.constraint(Predicate(syncPredicateWithError).error(pCatchFn));

    forGroupAndClone(type);

    await validation1.validate();

    expect(pCatchFn).toHaveBeenCalledTimes(1);
    expect(pCatchFn.mock.calls[0][0].message).toBe(syncPredicateWithError.msg);
  });

  it(
    'should invalidate a predicate if an error occurs in it and ' +
      'should throw an error if no error state callbacks were added',
    async () => {
      validation.constraint(syncPredicate).constraint(asyncPredicate);

      forGroupAndClone(type, false /* do not add error cb to the validation */);

      expect((await validation1.validate()).isValid).toBe(true);

      const [defaultValidator, syncValidator, asyncValidator] = [
        ...validation1.constraints,
      ].map(([, validator]) => validator);

      // throws an error since has no error state callbacks added
      // and the predicate invalidates
      syncPredicateWithoutError.mockImplementationOnce(syncPredicateWithError);
      await expect(validation1.validate()).rejects.toThrowError(
        syncPredicateWithError.msg,
      );
      expect(validation1.isValid).toBe(false);
      expect([
        defaultValidator.isValid,
        syncValidator.isValid,
        asyncValidator.isValid,
      ]).toStrictEqual([true, false, true]);

      syncValidator.error(pCatchFn); // an error state callback added

      // now the error is catched
      syncPredicateWithoutError.mockImplementationOnce(syncPredicateWithError);
      expect((await validation1.validate()).isValid).toBe(false);
      expect(validation1.isValid).toBe(false);
      expect([
        defaultValidator.isValid,
        syncValidator.isValid,
        asyncValidator.isValid,
      ]).toStrictEqual([true, false, true]);

      expect((await validation1.validate()).isValid).toBe(true);

      // throws an error since has no error state callbacks added
      // and the predicate invalidates
      asyncPredicateWithoutError.mockImplementationOnce(
        asyncPredicateWithError,
      );
      await expect(validation1.validate()).rejects.toThrowError(
        asyncPredicateWithError.msg,
      );
      expect(validation1.isValid).toBe(false);
      expect([
        defaultValidator.isValid,
        syncValidator.isValid,
        asyncValidator.isValid,
      ]).toStrictEqual([true, true, false]);

      asyncValidator.error(pCatchFn); // an error state callback added

      // now the error is catched
      asyncPredicateWithoutError.mockImplementationOnce(
        asyncPredicateWithError,
      );
      await expect(validation1.validate()).resolves.not.toThrow();
      expect(validation1.isValid).toBe(false);
      expect([
        defaultValidator.isValid,
        syncValidator.isValid,
        asyncValidator.isValid,
      ]).toStrictEqual([true, true, false]);

      expect((await validation1.validate()).isValid).toBe(true);
      expect([
        defaultValidator.isValid,
        syncValidator.isValid,
        asyncValidator.isValid,
      ]).toStrictEqual([true, true, true]);
      expect(validation1.isValid).toBe(true);

      asyncPredicateWithoutError.mockImplementationOnce(
        asyncPredicateWithError,
      );
      syncPredicateWithoutError.mockImplementationOnce(syncPredicateWithError);
      // the error is catched
      await expect(validation1.validate()).resolves.not.toThrow();

      // and the predicates invalidate
      expect(validation1.isValid).toBe(false);
      expect([
        defaultValidator.isValid,
        syncValidator.isValid,
        asyncValidator.isValid,
      ]).toStrictEqual([true, false, false]);
    },
  );

  it.each([
    { state: 'started' },
    { state: 'valid' },
    { state: 'invalid', constraint: () => false },
    { state: 'changed' },
    { state: 'validated' },
  ])(
    '$state: should forward an error further up',
    async ({ state, constraint }) => {
      const level2v = '\n2. validation level. (propagated)\n';
      const level1syncp = '\n1. sync predicate level. (originated)\n';
      const level1asyncp = '\n1. async predicate level. (originated)\n';

      forGroupAndClone(type);

      validation1.error((err, next) => {
        err.message = `${err.message}${level2v}`;

        next();
      });

      validation1.constraint(
        syncPredicate.error((err, next) => {
          err.message = `${err.message}${level1syncp}`;

          next();
        }),
      );

      syncPredicateWithoutError.mockImplementationOnce(syncPredicateWithError);
      await expect(validation1.validate()).rejects.toThrowError(
        syncPredicateWithError.msg + level1syncp + level2v,
      );

      validation1.constraint(
        asyncPredicate.error((err, next) => {
          err.message = `${err.message}${level1asyncp}`;

          next();
        }),
      );

      asyncPredicateWithoutError.mockImplementationOnce(
        asyncPredicateWithError,
      );
      await expect(validation1.validate()).rejects.toThrowError(
        asyncPredicateWithError.msg + level1asyncp + level2v,
      );

      if (constraint) syncPredicateWithoutError.mockImplementation(constraint);

      validation1.constraint(syncPredicate[state](pStateCallbackWithError));

      await expect(validation1.validate()).rejects.toThrowError(
        pStateCallbackWithError.msg + level1syncp + level2v,
      );

      if (constraint) syncPredicateWithoutError.mockImplementation(() => true);
    },
  );
});
