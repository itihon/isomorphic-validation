import { expect, it, describe, test, beforeEach } from '@jest/globals';
import ObservablePredicates from '../../src/types/observable-predicates.js';
import protocols from '../protocols.js';
import {
  op1,
  op2,
  op3,
  op4,
  obj1,
  obj2,
  obj3,
} from '../integration/observable-predicate.test.js';

let ops;

describe('ObservablePredicates - a collection of instances of ObservablePredicate', () => {
  test(...protocols.ObserverAnd.Observable(ObservablePredicates()));
  test(
    ...protocols.ConsoleRepresentation.Representable(ObservablePredicates()),
  );

  beforeEach(() => {
    ops = ObservablePredicates();
  });

  it.todo('debounce, (.invalid, .invalidate). WRITE IN E2E TESTS');
  it.todo('next with debounce, (.invalid, .invalidate). WRITE IN E2E TESTS');
  it.todo('console representation, json representation, run(id)');

  it('should be true while no predicates added', () => {
    expect(ops.isValid).toBe(true);
  });

  it('should add only instances of ObservablePredicate and return this', () => {
    // all imported observable predicates are in valid state
    // added
    ops
      .add(op1)
      .run()
      .then((res) => expect(res).toStrictEqual([true]));

    // ignored
    ops
      .add()
      .add([])
      .add(() => false)
      .add({})
      .add(null)
      .add(42)
      .add('42');

    // added
    ops
      .add(op2)
      .run()
      .then((res) => expect(res).toStrictEqual([true, true]));
    ops
      .add(op3)
      .run()
      .then((res) => expect(res).toStrictEqual([true, true, true]));
    ops
      .add(op4)
      .run()
      .then((res) => expect(res).toStrictEqual([true, true, true, true]));

    expect(ops.isValid).toBe(true);
  });

  it('should return a promise of results array and be valid when all are valid', async () => {
    ops.add(op1).add(op2).add(op3).add(op4);

    obj1.value = 'not only letters!@#$';
    expect(await ops.run()).toStrictEqual([true, true, true, true]); // kept valid
    expect(ops.isValid).toBe(true);

    obj2.value = 'not only letters!@#$_';
    expect(await ops.run()).toStrictEqual([true, false, true, true]);
    expect(ops.isValid).toBe(false);

    obj3.value = 16;
    expect(await ops.run()).toStrictEqual([true, false, false, true]);
    expect(ops.isValid).toBe(false);

    obj2.value = 'Firstname';
    expect(await ops.run()).toStrictEqual([true, true, false, false]);
    expect(ops.isValid).toBe(false);

    obj2.value = 'Lastname';
    obj3.value = 18;
    ops
      .run()
      .then((res) => expect(res).toStrictEqual([true, true, true, true]));
    expect(ops.isValid).toBe(true);
  });

  it('should run the next predicate only if the previous one is valid', async () => {
    ops
      .add(op2, { next: false })
      .add(op1, { next: false })
      .add(op3, { next: false })
      .add(op4, { next: false });

    expect(await ops.run()).toStrictEqual([true, true, true, true]);
    expect(ops.isValid).toBe(true);

    obj2.value = 'not only letters !@#$';
    expect(await ops.run()).toStrictEqual([false]);
    expect(ops.isValid).toBe(false);

    obj2.value = 'onlyletters';
    obj3.value = 16;
    expect(await ops.run()).toStrictEqual([true, true, false]);
    expect(ops.isValid).toBe(false);

    obj2.value = 'Firstname';
    obj3.value = 18;
    expect(await ops.run()).toStrictEqual([true, true, true, false]);
    expect(ops.isValid).toBe(false);

    obj2.value = 'Lastname';
    expect(await ops.run()).toStrictEqual([true, true, true, true]);
    expect(ops.isValid).toBe(true);
  });
});
