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

  const signUp = Validation.profile(
    '#my-form',
    ['firstName', 'lastName', 'email', 'age', 'password', 'pwdConfirm'],
    [firstNameV, lastNameV, emailV, ageV, passwordV, pwdConfirmV], // !!! try to dynamically import them instead
  );

  const [
    /* form, */
    [firstNameVp, lastNameVp, emailVp, ageVp, passwordVp, pwdConfirmVp],
  ] = signUp;

  // Constraints that are unique among validation profiles (should be added only to cloned Validations)

  Validation.glue([passwordVp, pwdConfirmVp]).constraint(areEqual);

  emailVp.constraint(isEmailNotBusy, { debounce: 2000 });

  const allVp = Validation.group([
    firstNameVp,
    lastNameVp,
    emailVp,
    ageVp,
    passwordVp,
    pwdConfirmVp,
  ]);

  allVp.validate();
  // form
  //     .validateOn('input') // same as .form.validateOn('input')
  //     .email.validateOn('change')
  //     .form.validateOn('input');

  // abstraction for client API: addEventListener
  // emailVp.listen(form.email, 'change', { target: true });
  // allVp.listen(form, 'input', { target: true });

  // allVp.listen(form, 'submit');

  // emailVp.listen(form.email, 'change', { target: true });
  // allVp.listen(form, 'input', { target: true });

  // allVp.server.listen(form, 'submit');

  /*
  or maybe

  const signUpForm = Validation.form(
    '#my-form',
    ['firstName', 'lastName', 'email', 'age', 'password', 'pwdConfirm'],
    [firstNameV, lastNameV, emailV, ageV, passwordV, pwdConfirmV],  

    Validation.glue(
      signUpForm.validations.password, 
      signUpForm.validations.pwdConfirm,
    ).constraint(areEqual);

    signUpForm.validations.email.client.constraint(isEmailNotBusyC, { debounce: 2000 });
    signUpForm.validations.email.server.constraint(isEmailNotBusyS, { debounce: 2000 });

    const allVp = Validation.group(
      signUpForm.validations.firstName,
      signUpForm.validations.lastName,
      signUpForm.validations.email,
      signUpForm.validations.age,
      signUpForm.validations.password,
      signUpForm.validations.pwdConfirm,
    );
    
    or maybe const allVp = Validation.group( ...signUpForm.validations ); // iterator protocol
  );

  // form.form.on('input', allVp, { target: true });
  // form.form.email.on('change', emailVp, { target: true , paramsForAddEventListener });

  
  app.post('/', allVp);
  app.post('/', signUpProfile); // because it contains the form

  // signUpForm.form.on('input', allVp, { target: true });
  signUpProfile.form.addEventListener('input', allVp.validate);
  signUpProfile.form.addEventListener('input', signUpProfile.validate);

  {
    validations: [],

    firstName: {
      value     
    },
    lastName: {

      value     
    },
    email: {

      value     
    },
    age: {
    
      value     
    },
    password: {

      value     
    },
    pwdConfirm: {
    
      value     
    },
  }

  */
});
