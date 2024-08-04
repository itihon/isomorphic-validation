import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Validation } from '../../src/index.js';
import {
  isEmail,
  isLongerThan,
  isShorterThan,
  areEqual,
  isEmailNotBusy,
  isOnlyLetters,
} from '../predicates.js';

let email;
let password;
let pwdconfirm;

const emailV = Validation();
const passwordV = Validation();
const pwdconfirmV = Validation();

emailV.constraint(isEmail).constraint(isShorterThan(45));

passwordV.constraint(isShorterThan(25));

Validation.group(emailV, passwordV, pwdconfirmV).constraint(isLongerThan(4));

const signInProfile = Validation.profile(
  '#signin',
  ['email', 'password'],
  [emailV, passwordV],
);

const signUpProfile = Validation.profile(
  '#signup',
  ['email', 'password', 'pwdconfirm'],
  [emailV, passwordV, pwdconfirmV],
);

signUpProfile.validation.email.constraint(isEmailNotBusy);
signInProfile.validation.password.constraint(isOnlyLetters);

const signInForm = signInProfile.form;
const signUpForm = signUpProfile.form;

// const signInVs = Validation.group(...signInProfile.validations);
// const signUpVs = Validation.group(...signUpProfile.validations);

const signInVs = signInProfile.validation;
const signUpVs = signUpProfile.validation;

Validation.glue(
  signUpProfile.validation.password,
  signUpProfile.validation.pwdconfirm,
).constraint(areEqual);

describe('Validation.profile', () => {
  beforeEach(async () => {
    email = '';
    password = '';
    pwdconfirm = '';

    signInForm.email.value = email;
    signInForm.password.value = password;

    signUpForm.email.value = email;
    signUpForm.password.value = password;
    signUpForm.pwdconfirm.value = pwdconfirm;

    await signInVs.validate();
    await signUpVs.validate();
    jest.clearAllMocks();
  });

  it('should validate signin validations and leave signup untouched', async () => {
    email = 'a@a.a';
    password = 'asdfg';

    signInForm.email.value = email;
    signInForm.password.value = password;
    await signInVs.validate();

    expect(isEmail.mock.calls).toStrictEqual([[email]]);
    expect(isLongerThan(4).mock.calls).toStrictEqual([[email], [password]]);
    expect(signInVs.isValid).toBe(true);

    expect(isEmailNotBusy).not.toHaveBeenCalled();
    expect(areEqual).not.toHaveBeenCalled();
    expect(signUpVs.isValid).toBe(false);
  });

  it('should validate signup validations and leave signin untouched', async () => {
    email = 'b@b.b';
    password = 'qwert';
    pwdconfirm = 'qwert';

    signUpForm.email.value = email;
    signUpForm.password.value = password;
    signUpForm.pwdconfirm.value = password;
    await signUpVs.validate();

    expect(isEmail.mock.calls).toStrictEqual([[email]]);
    expect(isLongerThan(4).mock.calls).toStrictEqual([
      [email],
      [password],
      [pwdconfirm],
    ]);
    expect(signUpVs.isValid).toBe(true);

    expect(isEmailNotBusy.mock.calls).toStrictEqual([[email]]);
    expect(areEqual).toHaveBeenCalledWith(password, pwdconfirm);
    expect(signInVs.isValid).toBe(false);
  });

  it('should validate both profiles not affecting each other', async () => {
    email = 'a@a.a';
    password = 'asdfg';

    signInForm.email.value = email;
    signInForm.password.value = password;

    await signInVs.validate();
    await signUpVs.validate();

    expect(isEmail.mock.calls).toStrictEqual([[email], ['']]);
    expect(isLongerThan(4).mock.calls).toStrictEqual([
      [email],
      [password],
      [''],
      [''],
      [''],
    ]);
    expect(isShorterThan(45).mock.calls).toStrictEqual([[email], ['']]);
    expect(isShorterThan(25).mock.calls).toStrictEqual([[password], ['']]);
    expect(isOnlyLetters.mock.calls).toStrictEqual([[password]]);
    expect(isEmailNotBusy.mock.calls).toStrictEqual([['']]);
    expect(areEqual.mock.calls).toStrictEqual([
      ['', ''],
      ['', ''],
    ]); // !glued predicate is called twice. One call is enough

    expect(signInVs.isValid).toBe(true);
    expect(signUpVs.isValid).toBe(false);

    jest.clearAllMocks();

    password = 'asdfg#';

    signInForm.email.value = email;
    signInForm.password.value = password;

    signUpForm.email.value = email;
    signUpForm.password.value = password;
    signUpForm.pwdconfirm.value = password;

    await signUpVs.validate();
    await signInVs.validate();

    expect(isEmail.mock.calls).toStrictEqual([[email], [email]]);
    expect(isLongerThan(4).mock.calls).toStrictEqual([
      [email],
      [password],
      [password],
      [email],
      [password],
    ]);
    expect(isShorterThan(45).mock.calls).toStrictEqual([[email], [email]]);
    expect(isShorterThan(25).mock.calls).toStrictEqual([
      [password],
      [password],
    ]);
    expect(isOnlyLetters.mock.calls).toStrictEqual([[password]]);
    expect(isEmailNotBusy.mock.calls).toStrictEqual([[email]]);
    expect(areEqual.mock.calls).toStrictEqual([
      [password, password],
      [password, password],
    ]); // !glued predicate is called twice. One call is enough

    expect(signInVs.isValid).toBe(false);
    expect(signUpVs.isValid).toBe(true);
  });
});