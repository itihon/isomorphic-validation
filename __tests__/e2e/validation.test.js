import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import { Validation } from '../../src/index.js';
import { isGreaterThan } from '../predicates';

const obj1 = { value: 1 };
const obj2 = { value: 42 };
const obj3 = { value: 43 };

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
      await v1.validate();
      expect(v1.isValid).toBe(false);
      expect(isGreaterThan(16)).toHaveBeenLastCalledWith(obj1.value);
      expect(isGreaterThan(16)).toHaveBeenCalledTimes(1);

      v1.bind(obj2);
      await v1.validate();
      expect(v1.isValid).toBe(true);
      expect(isGreaterThan(16)).toHaveBeenLastCalledWith(obj2.value);
      expect(isGreaterThan(16)).toHaveBeenCalledTimes(2);
    });

    it('should bind a cloned Validation to a validated object', async () => {
      v2 = Validation.clone(v1);
      v2.constraint(isGreaterThan(42));

      await v2.validate();
      expect(v2.isValid).toBe(false);
      expect(v1.isValid).toBe(true);
      expect(isGreaterThan(16)).toHaveBeenLastCalledWith(obj2.value);
      expect(isGreaterThan(16)).toHaveBeenCalledTimes(3);
      expect(isGreaterThan(42)).toHaveBeenLastCalledWith(obj2.value);
      expect(isGreaterThan(42)).toHaveBeenCalledTimes(1);

      v2.bind(obj3);
      await v2.validate();
      expect(v2.isValid).toBe(true);
      expect(v1.isValid).toBe(true);
      expect(isGreaterThan(16)).toHaveBeenLastCalledWith(obj3.value);
      expect(isGreaterThan(16)).toHaveBeenCalledTimes(4);
      expect(isGreaterThan(42)).toHaveBeenLastCalledWith(obj3.value);
      expect(isGreaterThan(42)).toHaveBeenCalledTimes(2);
    });

    it('validate a Validation in a group by a bound object', async () => {
      v1.validated(validatedCB1);
      v2.validated(validatedCB2);

      const vs1 = Validation.group(v1, v2);

      await vs1.validate(obj2);
      expect(validatedCB1).toHaveBeenCalledTimes(1);
      expect(validatedCB2).toHaveBeenCalledTimes(0); // 1???

      await vs1.validate(obj3);
      expect(validatedCB1).toHaveBeenCalledTimes(1); // 2 ???
      expect(validatedCB2).toHaveBeenCalledTimes(1); // 2 ???
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
});
