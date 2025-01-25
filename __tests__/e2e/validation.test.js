import {
  describe,
  it,
  expect,
  beforeAll,
  jest,
  beforeEach,
} from '@jest/globals';
import { Predicate, Validation } from '../../src/index.js';
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

    it('should set the right target to validation results in callbacks', async () => {
      const p1 = jest.fn(() => true);
      const p2 = jest.fn(() => false);

      const vStartedCB = jest.fn();
      const vValidCB = jest.fn();
      const vInvalidCB = jest.fn();
      const vChangedCB = jest.fn();
      const vValidatedCB = jest.fn();

      const vGlStartedCB = jest.fn();
      const vGlValidCB = jest.fn();
      const vGlInvalidCB = jest.fn();
      const vGlChangedCB = jest.fn();
      const vGlValidatedCB = jest.fn();

      const pStartedCB = jest.fn();
      const pValidCB = jest.fn();
      const pInvalidCB = jest.fn();
      const pChangedCB = jest.fn();
      const pValidatedCB = jest.fn();

      const validation = Validation(obj1) // bound to obj1 during creation
        .constraint(
          Predicate(p1)
            .started(pStartedCB)
            .valid(pValidCB)
            .changed(pChangedCB)
            .validated(pValidatedCB),
        )
        .started(vStartedCB)
        .valid(vValidCB)
        .changed(vChangedCB)
        .validated(vValidatedCB);

      jest.clearAllMocks();
      validation.bind(obj2); // bound to obj2
      await validation.validate();

      expect(vStartedCB.mock.calls[0][0].target).toBe(obj2);
      expect(vValidCB.mock.calls[0][0].target).toBe(obj2);
      expect(vChangedCB.mock.calls[0][0].target).toBe(obj2);
      expect(vValidatedCB.mock.calls[0][0].target).toBe(obj2);

      expect(pStartedCB.mock.calls[0][0].target).toBe(obj2);
      expect(pValidCB.mock.calls[0][0].target).toBe(obj2);
      expect(pChangedCB.mock.calls[0][0].target).toBe(obj2);
      expect(pValidatedCB.mock.calls[0][0].target).toBe(obj2);

      jest.clearAllMocks();
      const validationCl = Validation.clone(validation); // cloned bound to obj2
      await validationCl.validate();

      expect(vStartedCB.mock.calls[0][0].target).toBe(obj2);
      expect(vValidCB.mock.calls[0][0].target).toBe(obj2);
      expect(vChangedCB.mock.calls[0][0].target).toBe(obj2);
      expect(vValidatedCB.mock.calls[0][0].target).toBe(obj2);

      expect(pStartedCB.mock.calls[0][0].target).toBe(obj2);
      expect(pValidCB.mock.calls[0][0].target).toBe(obj2);
      expect(pChangedCB.mock.calls[0][0].target).toBe(obj2);
      expect(pValidatedCB.mock.calls[0][0].target).toBe(obj2);

      // invalidate before the next validation
      p1.mockImplementationOnce(() => false);
      await validationCl.validate();

      jest.clearAllMocks();
      validationCl.bind(obj3); // cloned bound to obj3
      await validationCl.validate();

      expect(vStartedCB.mock.calls[0][0].target).toBe(obj3);
      expect(vValidCB.mock.calls[0][0].target).toBe(obj3);
      expect(vChangedCB.mock.calls[0][0].target).toBe(obj3);
      expect(vValidatedCB.mock.calls[0][0].target).toBe(obj3);

      expect(pStartedCB.mock.calls[0][0].target).toBe(obj3);
      expect(pValidCB.mock.calls[0][0].target).toBe(obj3);
      expect(pChangedCB.mock.calls[0][0].target).toBe(obj3);
      expect(pValidatedCB.mock.calls[0][0].target).toBe(obj3);

      jest.clearAllMocks();
      expect(validation.isValid).toBe(true);
      expect(validationCl.isValid).toBe(true);
      const validationGl = Validation.glue(validation, validationCl) // glued the original and the cloned
        .constraint(Predicate(p2).invalid(pInvalidCB))
        .started(vGlStartedCB)
        .valid(vGlValidCB)
        .invalid(vGlInvalidCB)
        .changed(vGlChangedCB)
        .validated(vGlValidatedCB);

      validationGl.validations.forEach((v) => v.invalid(vInvalidCB));
      await validationGl.validate(obj3);

      expect(vStartedCB).toHaveBeenCalledTimes(1);
      expect(vValidCB).toHaveBeenCalledTimes(0);
      expect(vInvalidCB).toHaveBeenCalledTimes(1);
      expect(vChangedCB).toHaveBeenCalledTimes(2); // called twice on the "glued" validations
      expect(vValidatedCB).toHaveBeenCalledTimes(1);

      expect(vGlStartedCB).toHaveBeenCalledTimes(1);
      expect(vGlValidCB).toHaveBeenCalledTimes(0);
      expect(vGlInvalidCB).toHaveBeenCalledTimes(1);
      expect(vGlChangedCB).toHaveBeenCalledTimes(0);
      expect(vGlValidatedCB).toHaveBeenCalledTimes(1);

      expect(pStartedCB).toHaveBeenCalledTimes(1);
      expect(pValidCB).toHaveBeenCalledTimes(1);
      expect(pInvalidCB).toHaveBeenCalledTimes(2);
      expect(pChangedCB).toHaveBeenCalledTimes(0);
      expect(pValidatedCB).toHaveBeenCalledTimes(1);

      expect(vStartedCB.mock.calls[0][0].target).toBe(obj3);
      expect(vInvalidCB.mock.calls[0][0].target).toBe(obj3);
      expect(vChangedCB.mock.calls[0][0].target).toBe(obj2);
      expect(vChangedCB.mock.calls[1][0].target).toBe(obj3);
      expect(vValidatedCB.mock.calls[0][0].target).toBe(obj3);

      expect(vGlStartedCB.mock.calls[0][0].target).toBe(obj3);
      expect(vGlInvalidCB.mock.calls[0][0].target).toBe(obj3);
      expect(vGlValidatedCB.mock.calls[0][0].target).toBe(obj3);

      expect(pStartedCB.mock.calls[0][0].target).toBe(obj3);
      expect(pValidCB.mock.calls[0][0].target).toBe(obj3);
      expect(pInvalidCB.mock.calls[0][0].target).toBe(obj3);
      expect(pInvalidCB.mock.calls[1][0].target).toBe(obj2);
      expect(pValidatedCB.mock.calls[0][0].target).toBe(obj3);

      jest.clearAllMocks();
      p1.mockImplementation(() => false);
      p2.mockImplementation(() => true);
      await validationGl.validate();

      expect(vStartedCB).toHaveBeenCalledTimes(2);
      expect(vValidCB).toHaveBeenCalledTimes(0);
      expect(vInvalidCB).toHaveBeenCalledTimes(2);
      expect(vChangedCB).toHaveBeenCalledTimes(2); // validationCl changes 2 times, first the "glued" predicate p2 invoked on the original validation changes it
      expect(vValidatedCB).toHaveBeenCalledTimes(2);

      expect(vGlStartedCB).toHaveBeenCalledTimes(1);
      expect(vGlValidCB).toHaveBeenCalledTimes(0);
      expect(vGlInvalidCB).toHaveBeenCalledTimes(1);
      expect(vGlChangedCB).toHaveBeenCalledTimes(0);
      expect(vGlValidatedCB).toHaveBeenCalledTimes(1);

      expect(pStartedCB).toHaveBeenCalledTimes(2);
      expect(pValidCB).toHaveBeenCalledTimes(0);
      expect(pInvalidCB).toHaveBeenCalledTimes(0);
      expect(pChangedCB).toHaveBeenCalledTimes(2);
      expect(pValidatedCB).toHaveBeenCalledTimes(2);

      expect(vStartedCB.mock.calls[0][0].target).toBe(obj2);
      expect(vStartedCB.mock.calls[1][0].target).toBe(obj3);
      expect(vInvalidCB.mock.calls[0][0].target).toBe(obj2);
      expect(vInvalidCB.mock.calls[1][0].target).toBe(obj3);
      expect(vChangedCB.mock.calls[0][0].target).toBe(obj3); // p2 executed in the original validation runs its counterpart in validatinCl: { p1: true, p2: false } --> { p1: true, p2: true }
      expect(vChangedCB.mock.calls[1][0].target).toBe(obj3); // when both predicates have been executed in validationCl: { p1: true, p2: true } --> { p1: false, p2: true }
      expect(vValidatedCB.mock.calls[0][0].target).toBe(obj2);
      expect(vValidatedCB.mock.calls[1][0].target).toBe(obj3);

      expect(vGlStartedCB.mock.calls[0][0].target).toBe(undefined);
      expect(vGlInvalidCB.mock.calls[0][0].target).toBe(undefined);
      expect(vGlValidatedCB.mock.calls[0][0].target).toBe(undefined);

      expect(pStartedCB.mock.calls[0][0].target).toBe(obj2);
      expect(pStartedCB.mock.calls[1][0].target).toBe(obj3);
      expect(pChangedCB.mock.calls[0][0].target).toBe(obj2);
      expect(pChangedCB.mock.calls[1][0].target).toBe(obj3);
      expect(pValidatedCB.mock.calls[0][0].target).toBe(obj2);
      expect(pValidatedCB.mock.calls[1][0].target).toBe(obj3);
    });
  });

  describe('optional', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should run optional predicates only if the validatable value does not equal the initial value', async () => {
      const results = [];
      const validation = Validation(obj1, { optional: true });
      validation
        .constraint(isGreaterThan(42))
        .constraint(isGreaterThan(16))
        .constraint(isGreaterThan(1));

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
      results.push(validation.validate()); // true
      expect(isGreaterThan(42)).toHaveBeenCalledTimes(2);
      expect(isGreaterThan(16)).toHaveBeenCalledTimes(2);
      expect(isGreaterThan(1)).toHaveBeenCalledTimes(2);

      obj1.value = 44;
      results.push(validation.validate()); // true
      expect(isGreaterThan(42)).toHaveBeenCalledTimes(3);
      expect(isGreaterThan(16)).toHaveBeenCalledTimes(3);
      expect(isGreaterThan(1)).toHaveBeenCalledTimes(3);

      expect(
        (await Promise.all(results)).map((result) => result.isValid),
      ).toStrictEqual([false, true, true, true]);
    });

    it('should be valid by default when optional', async () => {
      const results = [];
      const validation = Validation(obj1, { optional: true });

      // After creation a Validation is in valid state since it is optional
      expect(validation.isValid).toBe(true);

      validation.constraint(isGreaterThan(42)).constraint(isGreaterThan(1));

      // remains valid by default after adding constraints
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

  describe('Iterator', () => {
    it.each([{ operation: 'group' }, { operation: 'clone' }])(
      '$operation: should iterate over constraints collection',
      async ({ operation }) => {
        const useIterator = (map) =>
          [...map].map(([obj, pred]) => [obj.value, pred[Symbol.toStringTag]]);

        const useForEach = (map) => {
          const result = [];
          map.forEach((pred, obj) =>
            result.push([obj.value, pred[Symbol.toStringTag]]),
          );
          return result;
        };

        const predicates = Array.from({ length: 9 })
          .map(
            (_, idx) =>
              ({ [`predicate${idx}`]: () => true })[`predicate${idx}`],
          )
          [Symbol.iterator]();

        const snapshot = [
          ['obj3', 'predicate0'],
          ['obj3', 'predicate1'],
          ['obj3', 'predicate8'],
          ['obj1', 'predicate2'],
          ['obj1', 'predicate3'],
          ['obj1', 'predicate6'],
          ['obj1', 'predicate7'],
          ['obj1', 'predicate8'],
          ['obj2', 'predicate4'],
          ['obj2', 'predicate5'],
          ['obj2', 'predicate6'],
          ['obj2', 'predicate7'],
          ['obj2', 'predicate8'],
        ];

        const object1 = { value: 'obj1' };
        const object2 = { value: 'obj2' };
        const object3 = { value: 'obj3' };

        const validation = Validation[operation](
          Validation.group(
            Validation(object3)
              .constraint(predicates.next().value) // 0
              .constraint(predicates.next().value), // 1

            Validation.group(
              Validation(object1)
                .constraint(predicates.next().value) // 2
                .constraint(predicates.next().value), // 3

              Validation(object2)
                .constraint(predicates.next().value) // 4
                .constraint(predicates.next().value), // 5
            )
              .constraint(predicates.next().value) // 6
              .constraint(predicates.next().value), // 7
          ).constraint(predicates.next().value), // 8
        );

        const { constraints } = validation;

        // iterable constraints property
        expect(useIterator(constraints)).toStrictEqual(snapshot);

        // forEach method of the constraints property
        expect(useForEach(constraints)).toStrictEqual(snapshot);

        // iterable validation result in predicate state callbacks
        let results = [];
        constraints.forEach((validator) =>
          validator.server.validated((result) => {
            results.push(...useIterator(result));
          }),
        );
        await validation.validate();
        expect(results).toStrictEqual(snapshot);

        // forEach method of validation result in predicate state callback
        let results2 = [];
        constraints.forEach((validator) =>
          validator.server.validated((result) => {
            results2.push(...useForEach(result));
          }),
        );
        await validation.validate();
        expect(results2).toStrictEqual(snapshot);

        // iterable validation result in validation state callbacks
        results = [];
        await validation
          .validated((result) => {
            results.push(...useIterator(result));
          })
          .validate();
        expect(results).toStrictEqual(snapshot.concat(snapshot));

        // forEach method of validation result in validation state callback
        results2 = [];
        await validation
          .validated((result) => {
            results2.push(...useForEach(result));
          })
          .validate();
        expect(results2).toStrictEqual(snapshot.concat(snapshot));

        // iterable validation result returned by Validation().validate()
        expect(useIterator(await validation.validate())).toStrictEqual(
          snapshot,
        );

        // forEach method validation result returned by Validation().validate()
        expect(useForEach(await validation.validate())).toStrictEqual(snapshot);
      },
    );
  });

  describe('JSON', () => {
    it.each([{ operation: 'group' }, { operation: 'clone' }])(
      '$operation: should generate correct JSON',
      async ({ operation }) => {
        const predicates = Array.from({ length: 11 }).map((_, idx) =>
          Object.defineProperty(
            jest.fn(() => idx > 5),
            'name',
            { value: `predicate${idx}` },
          ),
        );

        const object1 = { value: 'obj1', name: 'obj1' };
        const object2 = { value: 'obj2', name: 'obj2' };
        const object3 = { value: 'obj3', name: 'obj3' };

        const validation = Validation[operation](
          Validation.group(
            Validation(object3)
              .constraint(predicates[0], { idx: 0 })
              .constraint(predicates[1], { idx: 1 }),

            Validation.group(
              Validation(object1)
                .constraint(predicates[2], { idx: 2 })
                .constraint(predicates[3], { idx: 3 }),

              Validation(object2)
                .constraint(predicates[4], { idx: 4 })
                .constraint(predicates[5], { idx: 5 }),

              Validation(object3)
                .constraint(predicates[6], { idx: 6 })
                .constraint(predicates[7], { idx: 7 }),
            )
              .constraint(predicates[8], { idx: 8 })
              .constraint(predicates[9], { idx: 9 }),
          ).constraint(predicates[10], { idx: 10 }),
        );

        const { constraints } = validation;

        const snapshot1 = `
       {
        "isValid": false,
        "obj3": [
            {
              "0": { "name": "predicate0", "idx": 0, "isValid": false },
              "1": { "name": "predicate1", "idx": 1, "isValid": false },
              "2": { "name": "predicate10", "idx": 10, "isValid": false },
              "name": "PredicateGroup",
              "length": 3,
              "isValid": false
            },
            {
              "0": { "name": "predicate6", "idx": 6, "isValid": false },
              "1": { "name": "predicate7", "idx": 7, "isValid": false },
              "2": { "name": "predicate8", "idx": 8, "isValid": false },
              "3": { "name": "predicate9", "idx": 9, "isValid": false },
              "4": { "name": "predicate10", "idx": 10, "isValid": false },
              "name": "PredicateGroup",
              "length": 5,
              "isValid": false
            }
        ],
        "obj1": [
            {
              "0": { "name": "predicate2", "idx": 2, "isValid": false },
              "1": { "name": "predicate3", "idx": 3, "isValid": false },
              "2": { "name": "predicate8", "idx": 8, "isValid": false },
              "3": { "name": "predicate9", "idx": 9, "isValid": false },
              "4": { "name": "predicate10", "idx": 10, "isValid": false },
              "name": "PredicateGroup",
              "length": 5,
              "isValid": false
            }
        ],
        "obj2": [
            {
              "0": { "name": "predicate4", "idx": 4, "isValid": false },
              "1": { "name": "predicate5", "idx": 5, "isValid": false },
              "2": { "name": "predicate8", "idx": 8, "isValid": false },
              "3": { "name": "predicate9", "idx": 9, "isValid": false },
              "4": { "name": "predicate10", "idx": 10, "isValid": false },
              "name": "PredicateGroup",
              "length": 5,
              "isValid": false
            }
          ]
        } 
        `;

        expect(JSON.parse(JSON.stringify(constraints))).toStrictEqual(
          JSON.parse(snapshot1),
        );

        const snapshot2 = `
       {
        "isValid": false,
        "obj3": [
            {
              "0": { "name": "predicate0", "idx": 0, "isValid": false },
              "1": { "name": "predicate1", "idx": 1, "isValid": false },
              "2": { "name": "predicate10", "idx": 10, "isValid": true },
              "name": "PredicateGroup",
              "length": 3,
              "isValid": false
            },
            {
              "0": { "name": "predicate6", "idx": 6, "isValid": true },
              "1": { "name": "predicate7", "idx": 7, "isValid": true },
              "2": { "name": "predicate8", "idx": 8, "isValid": true },
              "3": { "name": "predicate9", "idx": 9, "isValid": true },
              "4": { "name": "predicate10", "idx": 10, "isValid": true },
              "name": "PredicateGroup",
              "length": 5,
              "isValid": true
            }
        ],
        "obj1": [
            {
              "0": { "name": "predicate2", "idx": 2, "isValid": false },
              "1": { "name": "predicate3", "idx": 3, "isValid": false },
              "2": { "name": "predicate8", "idx": 8, "isValid": true },
              "3": { "name": "predicate9", "idx": 9, "isValid": true },
              "4": { "name": "predicate10", "idx": 10, "isValid": true },
              "name": "PredicateGroup",
              "length": 5,
              "isValid": false
            }
        ],
        "obj2": [
            {
              "0": { "name": "predicate4", "idx": 4, "isValid": false },
              "1": { "name": "predicate5", "idx": 5, "isValid": false },
              "2": { "name": "predicate8", "idx": 8, "isValid": true },
              "3": { "name": "predicate9", "idx": 9, "isValid": true },
              "4": { "name": "predicate10", "idx": 10, "isValid": true },
              "name": "PredicateGroup",
              "length": 5,
              "isValid": false
            }
          ]
        } 
        `;

        expect(
          JSON.parse(JSON.stringify(await validation.validate())),
        ).toStrictEqual(JSON.parse(snapshot2));

        predicates.forEach((predicate, idx) =>
          predicate.mockImplementation(() => idx > 3),
        );

        const snapshot3 = `
       {
        "isValid": false,
        "obj3": [
            {
              "0": { "name": "predicate0", "idx": 0, "isValid": false },
              "1": { "name": "predicate1", "idx": 1, "isValid": false },
              "2": { "name": "predicate10", "idx": 10, "isValid": true },
              "name": "PredicateGroup",
              "length": 3,
              "isValid": false
            },
            {
              "0": { "name": "predicate6", "idx": 6, "isValid": true },
              "1": { "name": "predicate7", "idx": 7, "isValid": true },
              "2": { "name": "predicate8", "idx": 8, "isValid": true },
              "3": { "name": "predicate9", "idx": 9, "isValid": true },
              "4": { "name": "predicate10", "idx": 10, "isValid": true },
              "name": "PredicateGroup",
              "length": 5,
              "isValid": true
            }
        ],
        "obj1": [
            {
              "0": { "name": "predicate2", "idx": 2, "isValid": false },
              "1": { "name": "predicate3", "idx": 3, "isValid": false },
              "2": { "name": "predicate8", "idx": 8, "isValid": true },
              "3": { "name": "predicate9", "idx": 9, "isValid": true },
              "4": { "name": "predicate10", "idx": 10, "isValid": true },
              "name": "PredicateGroup",
              "length": 5,
              "isValid": false
            }
        ],
        "obj2": [
            {
              "0": { "name": "predicate4", "idx": 4, "isValid": true },
              "1": { "name": "predicate5", "idx": 5, "isValid": true },
              "2": { "name": "predicate8", "idx": 8, "isValid": true },
              "3": { "name": "predicate9", "idx": 9, "isValid": true },
              "4": { "name": "predicate10", "idx": 10, "isValid": true },
              "name": "PredicateGroup",
              "length": 5,
              "isValid": true
            }
          ]
        } 
        `;

        expect(
          JSON.parse(JSON.stringify(await validation.validate())),
        ).toStrictEqual(JSON.parse(snapshot3));

        predicates.forEach((predicate) =>
          predicate.mockImplementation(() => true),
        );

        const snapshot4 = `
       {
        "isValid": true,
        "obj3": [
            {
              "0": { "name": "predicate0", "idx": 0, "isValid": true },
              "1": { "name": "predicate1", "idx": 1, "isValid": true },
              "2": { "name": "predicate10", "idx": 10, "isValid": true },
              "name": "PredicateGroup",
              "length": 3,
              "isValid": true
            },
            {
              "0": { "name": "predicate6", "idx": 6, "isValid": true },
              "1": { "name": "predicate7", "idx": 7, "isValid": true },
              "2": { "name": "predicate8", "idx": 8, "isValid": true },
              "3": { "name": "predicate9", "idx": 9, "isValid": true },
              "4": { "name": "predicate10", "idx": 10, "isValid": true },
              "name": "PredicateGroup",
              "length": 5,
              "isValid": true
            }
        ],
        "obj1": [
            {
              "0": { "name": "predicate2", "idx": 2, "isValid": true },
              "1": { "name": "predicate3", "idx": 3, "isValid": true },
              "2": { "name": "predicate8", "idx": 8, "isValid": true },
              "3": { "name": "predicate9", "idx": 9, "isValid": true },
              "4": { "name": "predicate10", "idx": 10, "isValid": true },
              "name": "PredicateGroup",
              "length": 5,
              "isValid": true
            }
        ],
        "obj2": [
            {
              "0": { "name": "predicate4", "idx": 4, "isValid": true },
              "1": { "name": "predicate5", "idx": 5, "isValid": true },
              "2": { "name": "predicate8", "idx": 8, "isValid": true },
              "3": { "name": "predicate9", "idx": 9, "isValid": true },
              "4": { "name": "predicate10", "idx": 10, "isValid": true },
              "name": "PredicateGroup",
              "length": 5,
              "isValid": true
            }
          ]
        } 
        `;

        expect(
          JSON.parse(JSON.stringify(await validation.validate())),
        ).toStrictEqual(JSON.parse(snapshot4));
      },
    );
  });
});
