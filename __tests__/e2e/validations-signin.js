import { it } from '@jest/globals';
import { Validation } from '../../src/index.js';
import { areEqual, isEmailNotBusy } from '../predicates.js';
import {
  firstNameV,
  lastNameV,
  emailV,
  ageV,
  passwordV,
  pwdConfirmV,
} from './validations.js';

it.skip('', () => {
  // const validatedForm = Validation.form('#my-form', [
  //     'firstName', 'lastName', 'email', 'age', 'password', 'pwdConfirm'
  // ]);
  //
  // const [
  //     firstNameVc, lastNameVc, emailVc, ageVc, passwordVc, pwdConfirmVc
  // ] = Validation.clone([
  //     firstNameV, lastNameV, emailV, ageV, passwordV, pwdConfirmV
  // ]);
  //
  // Validation.bind(validatedForm, [
  //     firstNameVc, lastNameVc, emailVc, ageVc, passwordVc, pwdConfirmVc
  // ]);

  // combines Validation.form, Validation.clone, Validation.bind

  const signInProfile = Validation.profile(
    '#my-form',
    ['firstName', 'lastName', 'email', 'age', 'password', 'pwdConfirm'],
    [firstNameV, lastNameV, emailV, ageV, passwordV, pwdConfirmV], // !!! try to dynamically import them instead
  );

  const [
    form,
    [firstNameVp, lastNameVp, emailVp, ageVp, passwordVp, pwdConfirmVp],
  ] = signInProfile;

  // Constraints that are unique among validation profiles (should be added only to cloned Validations)

  Validation.glue([passwordVp, pwdConfirmVp]).constraint(areEqual);

  emailVp.constraint(isEmailNotBusy);

  const allVp = Validation.group([
    firstNameVp,
    lastNameVp,
    emailVp,
    ageVp,
    passwordVp,
    pwdConfirmVp,
  ]);

  // form
  //     .validateOn('input') // same as .form.validateOn('input')
  //     .email.validateOn('change')
  //     .form.validateOn('input');

  emailVp.listen(form.email, 'change', { target: true });
  allVp.listen(form, 'input', { target: true });
});
