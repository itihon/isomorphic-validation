import { it } from '@jest/globals';
import { Validation } from '../../src/index.js';
import {
  isEmail,
  isGreaterThan,
  isLessThan,
  isPositiveInt,
  isLongerThan,
  isShorterThan,
} from '../predicates.js';

const firstName = { value: 'John' };
const lastName = { value: 'Doe' };
const email = { value: 'johndoe@mail.com' };
const age = { value: '42' };
const password = { value: 'asdfg' };
const pwdConfirm = { value: 'asdfg' };

export const firstNameV = Validation(firstName);
export const lastNameV = Validation(lastName);
export const emailV = Validation(email);
export const ageV = Validation(age); // !!! optional
export const passwordV = Validation(password);
export const pwdConfirmV = Validation(pwdConfirm);

it.skip('', () => {
  // Constraints that are unique among Validations but common/shared among validation profiles

  emailV.constraint(isEmail, { next: false, debounce: 2000 });

  ageV
    .constraint(isPositiveInt)
    .constraint(isGreaterThan(17))
    .constraint(isLessThan(120));

  // Constraints that are common/shared between specified validations in all profiles

  Validation.group([firstNameV, lastNameV], { clone: false })
    .constraint(isLongerThan(0))
    .constraint(isShorterThan(21));

  Validation.group([emailV, passwordV], { clone: false })
    .constraint(isLongerThan(4))
    .constraint(isShorterThan(35));

  // !!!Constraints that are unique among validation profiles should be added only to cloned Validations
});
