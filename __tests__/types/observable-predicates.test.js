import { expect, it, describe, test, beforeEach, jest } from '@jest/globals';
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
import wait from '../../src/utils/wait.js';
import { isOnlyLetters } from '../predicates.js';

let ops;

describe('ObservablePredicates - a collection of instances of ObservablePredicate', () => {
  test(...protocols.ObserverAnd.Observable(ObservablePredicates()));
  test(
    ...protocols.ConsoleRepresentation.Representable(ObservablePredicates()),
  );

  beforeEach(() => {
    ops = ObservablePredicates();
  });

  it.todo(
    'next with debounce, (.invalid, .invalidate). WRITE IN E2E TESTS, OR IN INTEGRATION TESTS',
  );
  it.todo('next with debounce, (.cancel). WRITTEN IN E2E TESTS');
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
      .add(op3, { next: false })
      .add(op4, { next: false });

    expect(await ops.run()).toStrictEqual([true, true, true]);
    expect(ops.isValid).toBe(true);

    obj2.value = 'not only letters !@#$';
    expect(await ops.run()).toStrictEqual([false]);
    expect(ops.isValid).toBe(false);

    obj2.value = 'onlyletters';
    obj3.value = 16;
    expect(await ops.run()).toStrictEqual([true, false]);
    expect(ops.isValid).toBe(false);

    obj2.value = 'Firstname';
    obj3.value = 18;
    expect(await ops.run()).toStrictEqual([true, true, false]);
    expect(ops.isValid).toBe(false);

    obj2.value = 'Lastname';
    expect(await ops.run()).toStrictEqual([true, true, true]);
    expect(ops.isValid).toBe(true);
  });

  it('should clone an instance with next and debounce parameters', async () => {
    const onChangedCB1 = jest.fn();
    const onChangedCB2 = jest.fn();
    const ops1 = ObservablePredicates();

    op1.invalidate();
    op2.invalidate();
    op3.invalidate();

    expect(ops1.getValue()).toBe(true); // absense of predicates means valid state

    ops1
      .onChanged(onChangedCB1)
      .add(op1, { next: false })
      .add(op2, { debounce: 300, next: false });

    expect(ops1.getValue()).toBe(false); // becomes invalid after adding predicates before running them
    expect(onChangedCB1).toHaveBeenCalledTimes(1);

    const ops2 = ops1.clone();
    ops2.onChanged(onChangedCB2).add(op3);

    // console.log(ops1.getID(), ops1.getAll().map(p => p.getID()), ops2.getID(), ops2.getAll().map(p => p.getID()));
    expect(onChangedCB2).toHaveBeenCalledTimes(0); // CB was added after ops1 state changed

    expect(await ops1.run()).toStrictEqual([true, true]);
    expect(ops1.getValue()).toBe(true);
    expect(onChangedCB1).toHaveBeenCalledTimes(2);
    expect(onChangedCB2).toHaveBeenCalledTimes(0); // ops1 is not affected

    expect(await ops2.run()).toStrictEqual([true, true, true]);
    expect(onChangedCB2).toHaveBeenCalledTimes(1);

    obj2.value = 'not only letters !@#$%^&*';
    expect(ops1.getValue()).toBe(true);
    expect(await ops2.run()).toStrictEqual([true, false]); // next = false
    expect(ops2.getValue()).toBe(false);
    expect(ops1.getValue()).toBe(true); // !!! should not be affected
    expect(onChangedCB2).toHaveBeenCalledTimes(2);

    obj2.value = 'onlyLetters';
    expect(await ops2.run()).toStrictEqual([true, true, true]);
    expect(onChangedCB2).toHaveBeenCalledTimes(3);

    op3.invalidate();
    expect(ops2.getValue()).toBe(false);
    expect(onChangedCB2).toHaveBeenCalledTimes(4);
    expect(ops1.getValue()).toBe(true); // ops is not affected
    expect(onChangedCB1).toHaveBeenCalledTimes(2);

    expect(await ops2.run()).toStrictEqual([true, true, true]);
    expect(onChangedCB2).toHaveBeenCalledTimes(5);

    expect(ops2.getValue()).toBe(true);
    op1.invalidate();
    expect(ops2.getValue()).toBe(true); // !!! ops1 should not be affected
    expect(ops1.getValue()).toBe(false);
    expect(onChangedCB1).toHaveBeenCalledTimes(3);

    isOnlyLetters.mockClear();
    ops2.run();
    await wait(200);
    ops2.run();
    await wait(200);
    ops2.run();
    await wait(350);
    expect(isOnlyLetters.mock.calls).toStrictEqual([
      [obj1.value],
      [obj1.value],
      [obj1.value],
      [obj2.value],
    ]); // only one call of the debounced predicate
  });
});
