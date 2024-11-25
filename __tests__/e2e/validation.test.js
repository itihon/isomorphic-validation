import {
  describe,
  it,
  expect,
  beforeAll,
  jest,
  beforeEach,
} from '@jest/globals';
import { Validation } from '../../src/index.js';
import { isGreaterThan } from '../predicates';

let res;

const obj1 = { value: 1 };
const obj2 = { value: 42 };
const obj3 = { value: 43 };

const checkTargetStateCB = jest.fn();
const validatedCB1 = jest.fn();
const validatedCB2 = jest.fn();

const v1 = Validation(obj1);
let v2;
v1.constraint(isGreaterThan(16));

describe('Validation', () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });

  describe('bind', () => {
    it('should bind a Validation to a validated object', async () => {
      v1.validated(checkTargetStateCB);

      res = await v1.validate();
      expect(v1.isValid).toBe(false);
      expect(isGreaterThan(16)).toHaveBeenLastCalledWith(obj1.value);
      expect(isGreaterThan(16)).toHaveBeenCalledTimes(1);
      expect(res.target).toBe(obj1);
      expect(checkTargetStateCB.mock.lastCall[0].target).toBe(obj1);

      v1.bind(obj2);
      res = await v1.validate();
      expect(v1.isValid).toBe(true);
      expect(isGreaterThan(16)).toHaveBeenLastCalledWith(obj2.value);
      expect(isGreaterThan(16)).toHaveBeenCalledTimes(2);
      expect(res.target).toBe(obj2);
      expect(checkTargetStateCB.mock.lastCall[0].target).toBe(obj2);
    });

    it('should bind a cloned Validation to a validated object', async () => {
      v2 = Validation.clone(v1);
      v2.constraint(isGreaterThan(42));

      res = await v2.validate();
      expect(v2.isValid).toBe(false);
      expect(v1.isValid).toBe(true);
      expect(isGreaterThan(16)).toHaveBeenLastCalledWith(obj2.value);
      expect(isGreaterThan(16)).toHaveBeenCalledTimes(3);
      expect(isGreaterThan(42)).toHaveBeenLastCalledWith(obj2.value);
      expect(isGreaterThan(42)).toHaveBeenCalledTimes(1);
      expect(res.target).toBe(obj2);

      v2.bind(obj3);
      res = await v2.validate();
      expect(v2.isValid).toBe(true);
      expect(v1.isValid).toBe(true);
      expect(isGreaterThan(16)).toHaveBeenLastCalledWith(obj3.value);
      expect(isGreaterThan(16)).toHaveBeenCalledTimes(4);
      expect(isGreaterThan(42)).toHaveBeenLastCalledWith(obj3.value);
      expect(isGreaterThan(42)).toHaveBeenCalledTimes(2);
      expect(res.target).toBe(obj3);
    });

    it('validate a Validation in a group by a bound object', async () => {
      v1.validated(validatedCB1);
      v2.validated(validatedCB2);

      const vs1 = Validation.group(v1, v2);

      await vs1.validate(obj2);
      expect(validatedCB1).toHaveBeenCalledTimes(1);
      expect(validatedCB2).toHaveBeenCalledTimes(0); // 1???
      expect(validatedCB1.mock.calls[0][0].target).toBe(obj2);

      await vs1.validate(obj3);
      expect(validatedCB1).toHaveBeenCalledTimes(1); // 2 ???
      expect(validatedCB2).toHaveBeenCalledTimes(1); // 2 ???
      expect(validatedCB2.mock.calls[0][0].target).toBe(obj3);
    });

    it('should bind only single validations', () => {
      expect(() => Validation.group(v1, v2).bind(obj3)).toThrow(
        'Only single validation can be bound',
      );

      expect(() => Validation.glue(v1, v2).bind(obj3)).toThrow(
        'Only single validation can be bound',
      );
    });
  });

  describe('optional', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should run optional predicates only if the validatable value does not equal the initial value', async () => {
      const results = [];
      const validation = Validation(obj1);
      validation
        .constraint(isGreaterThan(42), { optional: true })
        .constraint(isGreaterThan(16))
        .constraint(isGreaterThan(1), { optional: true });

      obj1.value = 1;
      results.push(validation.validate()); // false
      expect(isGreaterThan(42)).toHaveBeenCalledTimes(1);
      expect(isGreaterThan(16)).toHaveBeenCalledTimes(1);
      expect(isGreaterThan(1)).toHaveBeenCalledTimes(1);

      obj1.value = 43;
      results.push(validation.validate()); // true
      expect(isGreaterThan(42)).toHaveBeenCalledTimes(2);
      expect(isGreaterThan(16)).toHaveBeenCalledTimes(2);
      expect(isGreaterThan(1)).toHaveBeenCalledTimes(2);

      obj1.value = ''; // initial value
      results.push(validation.validate()); // false
      expect(isGreaterThan(42)).toHaveBeenCalledTimes(2);
      expect(isGreaterThan(16)).toHaveBeenCalledTimes(3);
      expect(isGreaterThan(1)).toHaveBeenCalledTimes(2);

      obj1.value = 44;
      results.push(validation.validate()); // true
      expect(isGreaterThan(42)).toHaveBeenCalledTimes(3);
      expect(isGreaterThan(16)).toHaveBeenCalledTimes(4);
      expect(isGreaterThan(1)).toHaveBeenCalledTimes(3);

      expect(
        (await Promise.all(results)).map((result) => result.isValid),
      ).toStrictEqual([false, true, false, true]);
    });

    it('should be valid when has only optional predicates and the validatable value equals the initial value', async () => {
      const results = [];
      const validation = Validation(obj1);

      // validation with no constraints is valid
      expect(validation.isValid).toBe(true);

      validation
        .constraint(isGreaterThan(42), { optional: true })
        .constraint(isGreaterThan(1), { optional: true });

      // validation having only optional constraints is valid
      expect(validation.isValid).toBe(true);

      obj1.value = 1;
      results.push(validation.validate()); // false
      expect(isGreaterThan(42)).toHaveBeenCalledTimes(1);
      expect(isGreaterThan(1)).toHaveBeenCalledTimes(1);

      obj1.value = 43;
      results.push(validation.validate()); // true
      expect(isGreaterThan(42)).toHaveBeenCalledTimes(2);
      expect(isGreaterThan(1)).toHaveBeenCalledTimes(2);

      obj1.value = ''; // initial value
      results.push(validation.validate()); // true
      expect(isGreaterThan(42)).toHaveBeenCalledTimes(2);
      expect(isGreaterThan(1)).toHaveBeenCalledTimes(2);

      obj1.value = 44;
      results.push(validation.validate()); // true
      expect(isGreaterThan(42)).toHaveBeenCalledTimes(3);
      expect(isGreaterThan(1)).toHaveBeenCalledTimes(3);

      expect(
        (await Promise.all(results)).map((result) => result.isValid),
      ).toStrictEqual([false, true, true, true]);
    });
  });
});
