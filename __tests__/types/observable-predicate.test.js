import { expect, jest, it, describe, test } from '@jest/globals';
import Predicate from '../../src/types/predicate.js';
import ObservablePredicate from '../../src/types/observable-predicate.js';
import protocols from '../protocols.js';

describe('ObservablePredicate', () => {
  it.todo(
    '+ constructor: parameters: predicate and items. WRITTEN IN INTEGRATION TESTS',
  );
  it.todo('+ Can be subscribed to. WRITTEN IN INTEGRATION TESTS');

  it.todo('constructor: parameters: anyData');
  it.todo('console representation, op(,id)');

  it.todo(
    '+ constructor: parameters: keepValid. WRITTEN IN E2E AND INTEGRATION TESTS',
  );

  it('should accept predicate as the first parameter and return a function, otherwise return null', () => {
    expect(ObservablePredicate()).toBe(null);
    expect(ObservablePredicate({})).toBe(null);
    expect(ObservablePredicate([])).toBe(null);
    expect(ObservablePredicate('')).toBe(null);
    expect(ObservablePredicate('asdf')).toBe(null);
    expect(ObservablePredicate(42)).toBe(null);
    expect(ObservablePredicate(class SomeClass {})).toBe(null);

    expect(ObservablePredicate(Predicate(() => {}))).not.toBe(null);

    expect(ObservablePredicate(Predicate(() => false))()).toBe(false);
    expect(ObservablePredicate(Predicate(() => true))()).toBe(true);
  });

  it('is imposible to start an async predicate unless the previously launched is not finished', (done) => {
    const syncPredicate = jest.fn(() => true);
    const asyncPredicate = jest.fn(
      () =>
        new Promise((res) => {
          setTimeout(res, 1000, true);
        }),
    );

    const syncObsPredicate = ObservablePredicate(Predicate(syncPredicate));
    const asyncObsPredicate = ObservablePredicate(Predicate(asyncPredicate));

    const interval = setInterval(() => {
      expect(syncObsPredicate()).toBe(true);
      expect(asyncObsPredicate()).resolves.toBe(true);
      asyncObsPredicate().then((res) => expect(res).toBe(true));
    }, 200);

    setTimeout(() => {
      clearInterval(interval);
      done();

      expect(syncPredicate).toHaveBeenCalledTimes(5);
      expect(asyncPredicate).toHaveBeenCalledTimes(1);
    }, 1200);
  }, 2000);

  test(
    ...protocols.ObserverAnd.Observable(
      ObservablePredicate(Predicate(() => {})),
    ),
  );

  test(
    ...protocols.ConsoleRepresentation.Representable(
      ObservablePredicate(Predicate(() => {})),
    ),
  );

  it('invalidate sync', () => {
    const invalidCB = jest.fn();
    const onChangedCB = jest.fn();

    const obsPredicate = ObservablePredicate(Predicate(() => true));
    obsPredicate.onInvalid(invalidCB).onChanged(onChangedCB);

    expect(obsPredicate.getValue()).toBe(false);
    expect(obsPredicate()).toBe(true);
    expect(invalidCB).toHaveBeenCalledTimes(0);
    expect(onChangedCB).toHaveBeenCalledTimes(1);

    expect(obsPredicate.invalidate()).toBe(false);
    expect(obsPredicate.getValue()).toBe(false);
    expect(invalidCB).toHaveBeenCalledTimes(1);
    expect(onChangedCB).toHaveBeenCalledTimes(2);
  });

  it('invalidate async/then', (done) => {
    const invalidCB = jest.fn();
    const onChangedCB = jest.fn();

    const obsPredicate = ObservablePredicate(
      Predicate(
        () =>
          new Promise((res) => {
            setTimeout(res, 10, true);
          }),
      ),
    );
    obsPredicate.onInvalid(invalidCB).onChanged(onChangedCB);

    expect(obsPredicate.getValue()).toBe(false);
    expect(
      obsPredicate().then((res) => {
        expect(invalidCB).toHaveBeenCalledTimes(0);
        expect(onChangedCB).toHaveBeenCalledTimes(1);

        expect(obsPredicate.invalidate()).toBe(false);
        expect(obsPredicate.getValue()).toBe(false);
        expect(invalidCB).toHaveBeenCalledTimes(1);
        expect(onChangedCB).toHaveBeenCalledTimes(2);

        done();
        return res;
      }),
    ).resolves.toBe(true);
  });

  it('invalidate async/await', async () => {
    const invalidCB = jest.fn();
    const onChangedCB = jest.fn();

    const obsPredicate = ObservablePredicate(
      Predicate(
        () =>
          new Promise((res) => {
            setTimeout(res, 10, true);
          }),
      ),
    );
    obsPredicate.onInvalid(invalidCB).onChanged(onChangedCB);

    expect(obsPredicate.getValue()).toBe(false);
    expect(await obsPredicate()).toBe(true);
    expect(invalidCB).toHaveBeenCalledTimes(0);
    expect(onChangedCB).toHaveBeenCalledTimes(1);

    expect(obsPredicate.invalidate()).toBe(false);
    expect(obsPredicate.getValue()).toBe(false);
    expect(invalidCB).toHaveBeenCalledTimes(1);
    expect(onChangedCB).toHaveBeenCalledTimes(2);
  });
});
