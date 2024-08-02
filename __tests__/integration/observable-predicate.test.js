import { describe, jest, it, expect } from '@jest/globals';
import { isOnlyLetters, areNotEqual, isGreaterOrEqual } from '../predicates.js';
import ObserverAnd from '../../src/types/observer-and.js';
import ObservablePredicate from '../../src/types/observable-predicate.js';
import Predicate from '../../src/types/predicate.js';
import ValidatedItem from '../../src/types/validated-item.js';

const obj1 = { value: 'Firstname' };
const obj2 = { value: 'Lastname' };
const obj3 = { value: 42 };

const vi1 = ValidatedItem(obj1, 'value');
const vi2 = ValidatedItem(obj2, 'value');
const vi3 = ValidatedItem(obj3, 'value');

const validCB1 = jest.fn();
const invalidCB1 = jest.fn();
const changedCB1 = jest.fn();
const validatedCB1 = jest.fn();
const restoredCB1 = jest.fn();

const validCB2 = jest.fn();
const invalidCB2 = jest.fn();
const changedCB2 = jest.fn();
const validatedCB2 = jest.fn();
const restoredCB2 = jest.fn();

const validCB3 = jest.fn();
const invalidCB3 = jest.fn();
const changedCB3 = jest.fn();
const validatedCB3 = jest.fn();
const restoredCB3 = jest.fn();

const validCB4 = jest.fn();
const invalidCB4 = jest.fn();
const changedCB4 = jest.fn();
const validatedCB4 = jest.fn();
const restoredCB4 = jest.fn();

const onChangedCB = jest.fn();

const p1 = Predicate(isOnlyLetters)
  .valid(validCB1)
  .invalid(invalidCB1)
  .changed(changedCB1)
  .validated(validatedCB1)
  .restored(restoredCB1);

const p2 = Predicate(isOnlyLetters)
  .valid(validCB2)
  .invalid(invalidCB2)
  .changed(changedCB2)
  .validated(validatedCB2)
  .restored(restoredCB2);

const p3 = Predicate(isGreaterOrEqual(18))
  .valid(validCB3)
  .invalid(invalidCB3)
  .changed(changedCB3)
  .validated(validatedCB3)
  .restored(restoredCB3);

const p4 = Predicate(areNotEqual)
  .valid(validCB4)
  .invalid(invalidCB4)
  .changed(changedCB4)
  .validated(validatedCB4)
  .restored(restoredCB4);

const op1 = ObservablePredicate(p1, [vi1], true); // first name, letters
const op2 = ObservablePredicate(p2, [vi2]); // last name, letters
const op3 = ObservablePredicate(p3, [vi3]); // age, achived 18
const op4 = ObservablePredicate(p4, [vi1, vi2]); // firstname !== lastname

const oa = ObserverAnd()
  .subscribe(op1)
  .subscribe(op2)
  .subscribe(op3)
  .subscribe(op4)
  .onChanged(onChangedCB);

describe('ObservablePredicate, Predicate, ValidatedItem, ObserverAnd', () => {
  it('should be true when all predicates are true because subscribed', () => {
    expect(op1()).toBe(true);
    expect(isOnlyLetters).toHaveBeenCalledTimes(1);
    expect(validCB1).toHaveBeenCalledTimes(1);
    expect(invalidCB1).toHaveBeenCalledTimes(0);
    expect(changedCB1).toHaveBeenCalledTimes(1);
    expect(validatedCB1).toHaveBeenCalledTimes(1);
    expect(restoredCB1).toHaveBeenCalledTimes(0);
    expect(oa.getValue()).toBe(false);
    expect(onChangedCB).toHaveBeenCalledTimes(0);

    expect(op2()).toBe(true);
    expect(isOnlyLetters).toHaveBeenCalledTimes(2);
    expect(validCB2).toHaveBeenCalledTimes(1);
    expect(invalidCB2).toHaveBeenCalledTimes(0);
    expect(changedCB2).toHaveBeenCalledTimes(1);
    expect(validatedCB2).toHaveBeenCalledTimes(1);
    expect(restoredCB2).toHaveBeenCalledTimes(0);
    expect(oa.getValue()).toBe(false);
    expect(onChangedCB).toHaveBeenCalledTimes(0);

    expect(op3()).toBe(true);
    expect(isGreaterOrEqual(18)).toHaveBeenCalledTimes(1);
    expect(validCB3).toHaveBeenCalledTimes(1);
    expect(invalidCB3).toHaveBeenCalledTimes(0);
    expect(changedCB3).toHaveBeenCalledTimes(1);
    expect(validatedCB3).toHaveBeenCalledTimes(1);
    expect(restoredCB3).toHaveBeenCalledTimes(0);
    expect(oa.getValue()).toBe(false);
    expect(onChangedCB).toHaveBeenCalledTimes(0);

    expect(op4()).toBe(true);
    expect(areNotEqual).toHaveBeenCalledTimes(1);
    expect(validCB4).toHaveBeenCalledTimes(1);
    expect(invalidCB4).toHaveBeenCalledTimes(0);
    expect(changedCB4).toHaveBeenCalledTimes(1);
    expect(validatedCB4).toHaveBeenCalledTimes(1);
    expect(restoredCB4).toHaveBeenCalledTimes(0);
    expect(oa.getValue()).toBe(true);
    expect(onChangedCB).toHaveBeenCalledTimes(1);

    obj3.value = 16;
    expect(op3()).toBe(false);
    expect(isGreaterOrEqual(18)).toHaveBeenCalledTimes(2);
    expect(validCB3).toHaveBeenCalledTimes(1);
    expect(invalidCB3).toHaveBeenCalledTimes(1);
    expect(changedCB3).toHaveBeenCalledTimes(2);
    expect(validatedCB3).toHaveBeenCalledTimes(2);
    expect(restoredCB3).toHaveBeenCalledTimes(0);
    expect(oa.getValue()).toBe(false);
    expect(onChangedCB).toHaveBeenCalledTimes(2);

    obj3.value = 18;
    expect(op3()).toBe(true);
    expect(isGreaterOrEqual(18)).toHaveBeenCalledTimes(3);
    expect(validCB3).toHaveBeenCalledTimes(2);
    expect(invalidCB3).toHaveBeenCalledTimes(1);
    expect(changedCB3).toHaveBeenCalledTimes(3);
    expect(validatedCB3).toHaveBeenCalledTimes(3);
    expect(restoredCB3).toHaveBeenCalledTimes(0);
    expect(oa.getValue()).toBe(true);
    expect(onChangedCB).toHaveBeenCalledTimes(3);

    obj2.value = 'Firstname';
    expect(op2()).toBe(true);
    expect(isOnlyLetters).toHaveBeenCalledTimes(3);
    expect(validCB2).toHaveBeenCalledTimes(2);
    expect(invalidCB2).toHaveBeenCalledTimes(0);
    expect(changedCB2).toHaveBeenCalledTimes(1);
    expect(validatedCB2).toHaveBeenCalledTimes(2);
    expect(restoredCB2).toHaveBeenCalledTimes(0);
    expect(oa.getValue()).toBe(true);
    expect(onChangedCB).toHaveBeenCalledTimes(3);

    expect(op4()).toBe(false);
    expect(areNotEqual).toHaveBeenCalledTimes(2);
    expect(validCB4).toHaveBeenCalledTimes(1);
    expect(invalidCB4).toHaveBeenCalledTimes(1);
    expect(changedCB4).toHaveBeenCalledTimes(2);
    expect(validatedCB4).toHaveBeenCalledTimes(2);
    expect(restoredCB4).toHaveBeenCalledTimes(0);
    expect(oa.getValue()).toBe(false);
    expect(onChangedCB).toHaveBeenCalledTimes(4);

    obj2.value = 'Lastname';
    expect(op4()).toBe(true);
    expect(areNotEqual).toHaveBeenCalledTimes(3);
    expect(validCB4).toHaveBeenCalledTimes(2);
    expect(invalidCB4).toHaveBeenCalledTimes(1);
    expect(changedCB4).toHaveBeenCalledTimes(3);
    expect(validatedCB4).toHaveBeenCalledTimes(3);
    expect(restoredCB4).toHaveBeenCalledTimes(0);
    expect(oa.getValue()).toBe(true);
    expect(onChangedCB).toHaveBeenCalledTimes(5);
  });

  it("should pass all validated items' values to a predicate/validator function", () => {
    const predicateFn = jest.fn(() => true);
    const op = ObservablePredicate(Predicate(predicateFn), [vi1, vi2, vi3]);

    expect(op()).toBe(true);
    expect(predicateFn).toBeCalledWith(
      ...[obj1, obj2, obj3].map((obj) => obj.value),
    );
  });

  it('should be kept valid and call restored callbacks, and pass in the result', () => {
    obj1.value = '5';
    expect(op1()).toBe(true);
    expect(isOnlyLetters).toHaveBeenCalledTimes(5); // !!called twice
    expect(validCB1).toHaveBeenCalledTimes(2);
    expect(invalidCB1).toHaveBeenCalledTimes(0);
    expect(changedCB1).toHaveBeenCalledTimes(1);
    expect(validatedCB1).toHaveBeenCalledTimes(2);
    expect(restoredCB1).toHaveBeenCalledTimes(1);
    expect(restoredCB1).lastCalledWith(...validatedCB1.mock.calls[1]);
    expect(oa.getValue()).toBe(true);
    expect(onChangedCB).toHaveBeenCalledTimes(7); // !!called twice, notified subscribers twice
  });

  it('should clone an instance', () => {
    const onInvalidCB5 = jest.fn();
    const onInvalidCB6 = jest.fn();
    const onChangedCB56 = jest.fn();
    const oa56 = ObserverAnd();

    //              +invalidCB5   +invalidCB6
    // op2    ->    op5     ->    op6
    const op5 = op2.clone();
    op5.onInvalid(onInvalidCB5);

    const op6 = op5.clone();
    op6.onInvalid(onInvalidCB6);

    oa56.subscribe(op5).subscribe(op6).onChanged(onChangedCB56);

    expect(op2.clone()).not.toBe(op2);

    expect(onChangedCB).toHaveBeenCalledTimes(7);
    expect(onChangedCB56).toHaveBeenCalledTimes(0);
    expect(onInvalidCB5).toHaveBeenCalledTimes(0);
    expect(onInvalidCB6).toHaveBeenCalledTimes(0);
    expect(oa.getValue()).toBe(true);
    expect(oa56.getValue()).toBe(false);

    expect(op5()).toBe(true);
    expect(op6()).toBe(true);
    expect(onChangedCB56).toHaveBeenCalledTimes(1);
    expect(oa56.getValue()).toBe(true);

    obj2.value = '42';

    expect(op5()).toBe(false);
    expect(onChangedCB).toHaveBeenCalledTimes(7);
    expect(onChangedCB56).toHaveBeenCalledTimes(2);
    expect(onInvalidCB5).toHaveBeenCalledTimes(1);
    expect(onInvalidCB6).toHaveBeenCalledTimes(0);
    expect(oa.getValue()).toBe(true);
    expect(oa56.getValue()).toBe(false);

    expect(op6()).toBe(false);
    expect(onChangedCB).toHaveBeenCalledTimes(7);
    expect(onChangedCB56).toHaveBeenCalledTimes(2);
    expect(onInvalidCB5).toHaveBeenCalledTimes(1);
    expect(onInvalidCB6).toHaveBeenCalledTimes(1);
    expect(oa.getValue()).toBe(true); // was not affected
    expect(oa56.getValue()).toBe(false);

    obj2.value = 'Lastname';

    expect(op5()).toBe(true);
    expect(op6()).toBe(true);
    expect(onChangedCB).toHaveBeenCalledTimes(7);
    expect(onChangedCB56).toHaveBeenCalledTimes(3);
    expect(onInvalidCB5).toHaveBeenCalledTimes(1);
    expect(onInvalidCB6).toHaveBeenCalledTimes(1);
    expect(oa.getValue()).toBe(true);
    expect(oa56.getValue()).toBe(true);

    op2.invalidate();
    expect(oa.getValue()).toBe(false);
    expect(oa56.getValue()).toBe(true); // was not affected

    expect(op2()).toBe(true);
    expect(oa.getValue()).toBe(true);
    expect(oa56.getValue()).toBe(true);

    op5.invalidate();
    expect(oa.getValue()).toBe(true); // was not affected
    expect(oa56.getValue()).toBe(false);
  });

  it('should not invalidate each other since cloned', () => {
    const op2cb = op2.clone(); // cloned before
    const op3cb = op3.clone(); // cloned before

    op2cb.onInvalid(op3cb.invalidate);
    op2.onInvalid(op3.invalidate);

    const op2ca = op2.clone(); // cloned after
    const op3ca = op3.clone(); // cloned after

    op2ca.onInvalid(op3ca.invalidate);

    expect(op2cb()).toBe(true);
    expect(op3cb()).toBe(true);
    expect(op2ca()).toBe(true);
    expect(op3ca()).toBe(true);

    expect(op2.getValue()).toBe(true);
    expect(op3.getValue()).toBe(true);
    expect(op2cb.getValue()).toBe(true);
    expect(op3cb.getValue()).toBe(true);
    expect(op2ca.getValue()).toBe(true);
    expect(op3ca.getValue()).toBe(true);

    op2.invalidate();

    expect(op2.getValue()).toBe(false);
    expect(op3.getValue()).toBe(false);
    expect(op2cb.getValue()).toBe(true);
    expect(op3cb.getValue()).toBe(true);
    expect(op2ca.getValue()).toBe(true);
    expect(op3ca.getValue()).toBe(true);

    expect(op2()).toBe(true);
    expect(op3()).toBe(true);

    op2cb.invalidate();

    expect(op2.getValue()).toBe(true);
    expect(op3.getValue()).toBe(true);
    expect(op2cb.getValue()).toBe(false);
    expect(op3cb.getValue()).toBe(false);
    expect(op2ca.getValue()).toBe(true);
    expect(op3ca.getValue()).toBe(true);

    expect(op2cb()).toBe(true);
    expect(op3cb()).toBe(true);

    op2ca.invalidate();

    expect(op2.getValue()).toBe(true);
    expect(op3.getValue()).toBe(true);
    expect(op2cb.getValue()).toBe(true);
    expect(op3cb.getValue()).toBe(true);
    expect(op2ca.getValue()).toBe(false);
    expect(op3ca.getValue()).toBe(false);
  });
});
