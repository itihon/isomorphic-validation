import { it, describe, expect } from '@jest/globals';
import { allInvalid } from '../../src/index.helpers.js';
import { Validation } from '../../src/index.js';

describe('allInvalid', () => {
  it('should return all invalid validator', async () => {
    const obj1 = { value: '1' };
    const obj2 = { value: '2' };
    const obj3 = { value: '3' };

    const checkExpectedInvalidValidators =
      (expectedEntries = [[]]) =>
      (res) => {
        expect(
          allInvalid(res).map(([obj, validator]) =>
            validator && obj ? [obj, Object(validator).n] : [],
          ),
        ).toStrictEqual(expectedEntries);
      };

    const v1 = Validation(obj1)
      .constraint(() => true, { n: 1 })
      .constraint(() => false, { n: 2 })
      .constraint(() => true, { n: 3 })
      .constraint(() => false, { n: 4 })
      .validated(
        checkExpectedInvalidValidators([
          [obj1, 2],
          [obj1, 4],
        ]),
      );

    const v2 = Validation(obj2)
      .constraint(() => false, { n: 1 })
      .constraint(() => false, { n: 2 })
      .constraint(() => true, { n: 3 })
      .constraint(() => false, { n: 4 })
      .validated(
        checkExpectedInvalidValidators([
          [obj2, 1],
          [obj2, 2],
          [obj2, 4],
        ]),
      );

    const v3 = Validation(obj3)
      .constraint(() => true, { n: 1 })
      .constraint(() => true, { n: 2 })
      .constraint(() => true, { n: 3 })
      .constraint(() => false, { n: 4 })
      .validated(checkExpectedInvalidValidators([[obj3, 4]]));

    const v4 = Validation()
      .constraint(() => true, { n: 1 })
      .constraint(() => true, { n: 2 })
      .constraint(() => true, { n: 3 })
      .constraint(() => true, { n: 4 })
      .validated(checkExpectedInvalidValidators());

    const vGr1 = Validation.group(v4, v3, v2).validated(
      checkExpectedInvalidValidators([
        [obj3, 4],
        [obj2, 1],
        [obj2, 2],
        [obj2, 4],
      ]),
    );

    const vGr2 = Validation.group(v2, v4, v3).validated(
      checkExpectedInvalidValidators([
        [obj2, 1],
        [obj2, 2],
        [obj2, 4],
        [obj3, 4],
      ]),
    );

    await v1.validate();
    await v2.validate();
    await v3.validate();
    await v4.validate();
    await vGr1.validate();
    await vGr2.validate();
  });
});
