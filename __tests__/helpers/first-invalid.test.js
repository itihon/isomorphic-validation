import { it, describe, expect } from '@jest/globals';
import { firstInvalid } from '../../src/index.ui.js';
import { Validation } from '../../src/index.js';

describe('firstInvalid', () => {
  it('should return the first invalid validator', async () => {
    const obj1 = { value: '1' };
    const obj2 = { value: '2' };
    const obj3 = { value: '3' };

    const checkExpectedInvalidValidator = (expectedObj, expectedN) => (res) => {
      const [obj, validator] = firstInvalid(res);
      expect(obj).toBe(expectedObj);
      expect(Object(validator).n).toBe(expectedN);
    };

    const v1 = Validation(obj1)
      .constraint(() => true, { n: 1 })
      .constraint(() => false, { n: 2 })
      .constraint(() => true, { n: 3 })
      .constraint(() => false, { n: 4 })
      .validated(checkExpectedInvalidValidator(obj1, 2));

    const v2 = Validation(obj2)
      .constraint(() => false, { n: 1 })
      .constraint(() => false, { n: 2 })
      .constraint(() => true, { n: 3 })
      .constraint(() => false, { n: 4 })
      .validated(checkExpectedInvalidValidator(obj2, 1));

    const v3 = Validation(obj3)
      .constraint(() => true, { n: 1 })
      .constraint(() => true, { n: 2 })
      .constraint(() => true, { n: 3 })
      .constraint(() => false, { n: 4 })
      .validated(checkExpectedInvalidValidator(obj3, 4));

    const v4 = Validation()
      .constraint(() => true, { n: 1 })
      .constraint(() => true, { n: 2 })
      .constraint(() => true, { n: 3 })
      .constraint(() => true, { n: 4 })
      .validated(checkExpectedInvalidValidator());

    const vGr1 = Validation.group(v4, v3, v2).validated(
      checkExpectedInvalidValidator(obj3, 4),
    );

    const vGr2 = Validation.group(v2, v4, v3).validated(
      checkExpectedInvalidValidator(obj2, 1),
    );

    await v1.validate();
    await v2.validate();
    await v3.validate();
    await v4.validate();
    await vGr1.validate();
    await vGr2.validate();
  });
});
