import { expect, it, describe, test, beforeEach } from '@jest/globals';
import ObservablePredicates from '../../src/types/observable-predicates.js';
import protocols from '../protocols.js';
import ValidatableItem from '../../src/types/validatable-item.js';
import Predicate from '../../src/types/predicate.js';
import ObservablePredicate from '../../src/types/observable-predicate.js';
import { isOnlyLetters, areNotEqual, isGreaterThan } from '../predicates.js';

const obj1 = { value: 'Firstname' };
const obj2 = { value: 'Lastname' };
const obj3 = { value: 42 };

const vi1 = ValidatableItem(obj1, 'value');
const vi2 = ValidatableItem(obj2, 'value');
const vi3 = ValidatableItem(obj3, 'value');

const p1 = Predicate(isOnlyLetters);
const p2 = Predicate(isOnlyLetters);
const p3 = Predicate(isGreaterThan(18));
const p4 = Predicate(areNotEqual);

const op1 = ObservablePredicate(p1, [vi1], true); // first name, letters
const op2 = ObservablePredicate(p2, [vi2]); // last name, letters
const op3 = ObservablePredicate(p3, [vi3]); // age, achived 18
const op4 = ObservablePredicate(p4, [vi1, vi2]); // firstname !== lastname

let ops;

describe('ObservablePredicates - a collection of instances of ObservablePredicate', () => {
  test(...protocols.ObserverAnd.Observable(ObservablePredicates()));
  test(
    ...protocols.ConsoleRepresentation.Representable(ObservablePredicates()),
  );

  beforeEach(() => {
    ops = ObservablePredicates();
  });

  it.todo('console representation, json representation, run(id)');

  it('the initial value should be false', () => {
    expect(ops.isValid).toBe(false);
  });

  it('should add only instances of ObservablePredicate and return this', () => {
    // all imported observable predicates are in valid state
    // added
    ops
      .add(op1)
      .run()
      .then((res) => expect(res).toStrictEqual([true]));

    expect(() => ops.add()).toThrow();
    expect(() => ops.add([])).toThrow();
    expect(() => ops.add(() => false)).toThrow();
    expect(() => ops.add({})).toThrow();
    expect(() => ops.add(null)).toThrow();
    expect(() => ops.add(42)).toThrow();
    expect(() => ops.add('42')).toThrow();

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
    obj3.value = 19;
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
    obj3.value = 19;
    expect(await ops.run()).toStrictEqual([true, true, false]);
    expect(ops.isValid).toBe(false);

    obj2.value = 'Lastname';
    expect(await ops.run()).toStrictEqual([true, true, true]);
    expect(ops.isValid).toBe(true);
  });
});
