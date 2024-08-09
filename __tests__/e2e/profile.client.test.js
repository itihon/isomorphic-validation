/**
 * @jest-environment jsdom
 */
import { it, expect, describe, beforeEach, jest } from '@jest/globals';
import { IS_CLIENT, IS_SERVER } from '../../src/utils/getenv.js';
import { Validation } from '../../src/index.js';
import { isEmail, isEmailNotBusy, areEqual } from '../predicates.js';

document.body.innerHTML = `
    <form id="signup">
        <input type="email" name="email" value=""></input>
        <input type="password" name="password" value=""></input>
        <input type="password" name="pwdconfirm" value=""></input>
    </form>
`;

const e = { target: null };

const emailV = Validation();
const passwordV = Validation();
const pwdconfirmV = Validation();

emailV.constraint(isEmail, { next: false });

const signUpProfile = Validation.profile(
  '#signup',
  ['email', 'password', 'pwdconfirm'],
  [emailV, passwordV, pwdconfirmV],
);

const signUpForm = signUpProfile.form;
const signUpVs = signUpProfile.validation;

signUpProfile.validation.email.constraint(isEmailNotBusy, { debounce: 100 });

Validation.glue(
  signUpProfile.validation.password,
  signUpProfile.validation.pwdconfirm,
).constraint(areEqual);

describe('Validation.profile', () => {
  beforeEach(async () => {
    signUpForm.elements.email.value = '';
    signUpForm.elements.password.value = '';
    signUpForm.elements.pwdconfirm.value = '';
    await signUpVs.validate();
    jest.clearAllMocks();
  });

  it('should be a client', () => {
    expect(IS_CLIENT).toBe(true);
    expect(IS_SERVER).toBe(false);
  });

  it('should validate a grouping validation via the event handler', async () => {
    signUpForm.elements.email.value = 'q.';
    signUpForm.elements.password.value = '';
    signUpForm.elements.pwdconfirm.value = '';
    e.target = signUpForm.elements.email;

    expect((await signUpVs(e)).isValid).toBe(false);
    expect(signUpVs.email.isValid).toBe(false);
    expect(signUpVs.password.isValid).toBe(false);
    expect(signUpVs.pwdconfirm.isValid).toBe(false);
    expect(signUpVs.isValid).toBe(false);
    expect(isEmail.mock.calls).toStrictEqual([['q.']]);
    expect(isEmailNotBusy.mock.calls).toStrictEqual([]);
    expect(areEqual.mock.calls).toStrictEqual([]);

    signUpForm.elements.email.value = 'q@q.q';
    signUpForm.elements.password.value = '';
    signUpForm.elements.pwdconfirm.value = '';
    e.target = signUpForm.elements.email;

    expect((await signUpVs(e)).isValid).toBe(false);
    expect(signUpVs.email.isValid).toBe(false);
    expect(signUpVs.password.isValid).toBe(false);
    expect(signUpVs.pwdconfirm.isValid).toBe(false);
    expect(signUpVs.isValid).toBe(false);
    expect(isEmail.mock.calls).toStrictEqual([['q.'], ['q@q.q']]);
    expect(isEmailNotBusy.mock.calls).toStrictEqual([['q@q.q']]);
    expect(areEqual.mock.calls).toStrictEqual([]);

    signUpForm.elements.email.value = 'a@a.a';
    signUpForm.elements.password.value = '';
    signUpForm.elements.pwdconfirm.value = '';
    e.target = signUpForm.elements.email;

    expect((await signUpVs(e)).isValid).toBe(true);
    expect(signUpVs.email.isValid).toBe(true);
    expect(signUpVs.password.isValid).toBe(false);
    expect(signUpVs.pwdconfirm.isValid).toBe(false);
    expect(signUpVs.isValid).toBe(false);
    expect(isEmail.mock.calls).toStrictEqual([['q.'], ['q@q.q'], ['a@a.a']]);
    expect(isEmailNotBusy.mock.calls).toStrictEqual([['q@q.q'], ['a@a.a']]);
    expect(areEqual.mock.calls).toStrictEqual([]);

    signUpForm.elements.email.value = 'a@a.a';
    signUpForm.elements.password.value = 'asdfg';
    signUpForm.elements.pwdconfirm.value = '';
    e.target = signUpForm.elements.password;

    expect((await signUpVs(e)).isValid).toBe(false);
    expect(signUpVs.email.isValid).toBe(true);
    expect(signUpVs.password.isValid).toBe(false);
    expect(signUpVs.pwdconfirm.isValid).toBe(false);
    expect(signUpVs.isValid).toBe(false);
    expect(isEmail.mock.calls).toStrictEqual([['q.'], ['q@q.q'], ['a@a.a']]);
    expect(isEmailNotBusy.mock.calls).toStrictEqual([['q@q.q'], ['a@a.a']]);
    expect(areEqual.mock.calls).toStrictEqual([['asdfg', '']]);

    signUpForm.elements.email.value = 'a@a.a';
    signUpForm.elements.password.value = 'asdfg';
    signUpForm.elements.pwdconfirm.value = 'asdfg';
    e.target = signUpForm.elements.password;

    expect((await signUpVs(e)).isValid).toBe(true);
    expect(signUpVs.email.isValid).toBe(true);
    expect(signUpVs.password.isValid).toBe(true);
    expect(signUpVs.pwdconfirm.isValid).toBe(true);
    expect(signUpVs.isValid).toBe(true);
    expect(isEmail.mock.calls).toStrictEqual([['q.'], ['q@q.q'], ['a@a.a']]);
    expect(isEmailNotBusy.mock.calls).toStrictEqual([['q@q.q'], ['a@a.a']]);
    expect(areEqual.mock.calls).toStrictEqual([
      ['asdfg', ''],
      ['asdfg', 'asdfg'],
    ]);
  });

  it('should validate the grouped validations via the event handler', async () => {
    signUpForm.elements.email.value = 'q.';
    signUpForm.elements.password.value = '';
    signUpForm.elements.pwdconfirm.value = '';
    e.target = signUpForm.elements.email;

    expect((await signUpVs.email(e)).isValid).toBe(false);
    expect(signUpVs.email.isValid).toBe(false);
    expect(signUpVs.password.isValid).toBe(false);
    expect(signUpVs.pwdconfirm.isValid).toBe(false);
    expect(signUpVs.isValid).toBe(false);
    expect(isEmail.mock.calls).toStrictEqual([['q.']]);
    expect(isEmailNotBusy.mock.calls).toStrictEqual([]);
    expect(areEqual.mock.calls).toStrictEqual([]);

    signUpForm.elements.email.value = 'q@q.q';
    signUpForm.elements.password.value = '';
    signUpForm.elements.pwdconfirm.value = '';
    e.target = signUpForm.elements.email;

    expect((await signUpVs.email(e)).isValid).toBe(false);
    expect(signUpVs.email.isValid).toBe(false);
    expect(signUpVs.password.isValid).toBe(false);
    expect(signUpVs.pwdconfirm.isValid).toBe(false);
    expect(signUpVs.isValid).toBe(false);
    expect(isEmail.mock.calls).toStrictEqual([['q.'], ['q@q.q']]);
    expect(isEmailNotBusy.mock.calls).toStrictEqual([['q@q.q']]);
    expect(areEqual.mock.calls).toStrictEqual([]);

    signUpForm.elements.email.value = 'a@a.a';
    signUpForm.elements.password.value = '';
    signUpForm.elements.pwdconfirm.value = '';
    e.target = signUpForm.elements.email;

    expect((await signUpVs.email(e)).isValid).toBe(true);
    expect(signUpVs.email.isValid).toBe(true);
    expect(signUpVs.password.isValid).toBe(false);
    expect(signUpVs.pwdconfirm.isValid).toBe(false);
    expect(signUpVs.isValid).toBe(false);
    expect(isEmail.mock.calls).toStrictEqual([['q.'], ['q@q.q'], ['a@a.a']]);
    expect(isEmailNotBusy.mock.calls).toStrictEqual([['q@q.q'], ['a@a.a']]);
    expect(areEqual.mock.calls).toStrictEqual([]);

    signUpForm.elements.email.value = 'a@a.a';
    signUpForm.elements.password.value = 'asdfg';
    signUpForm.elements.pwdconfirm.value = '';
    e.target = signUpForm.elements.password;

    expect((await signUpVs.password(e)).isValid).toBe(false);
    expect(signUpVs.email.isValid).toBe(true);
    expect(signUpVs.password.isValid).toBe(false);
    expect(signUpVs.pwdconfirm.isValid).toBe(false);
    expect(signUpVs.isValid).toBe(false);
    expect(isEmail.mock.calls).toStrictEqual([['q.'], ['q@q.q'], ['a@a.a']]);
    expect(isEmailNotBusy.mock.calls).toStrictEqual([['q@q.q'], ['a@a.a']]);
    expect(areEqual.mock.calls).toStrictEqual([['asdfg', '']]);

    signUpForm.elements.email.value = 'a@a.a';
    signUpForm.elements.password.value = 'asdfg';
    signUpForm.elements.pwdconfirm.value = 'asdfg';
    e.target = signUpForm.elements.password;

    expect((await signUpVs.password(e)).isValid).toBe(true);
    expect(signUpVs.email.isValid).toBe(true);
    expect(signUpVs.password.isValid).toBe(true);
    expect(signUpVs.pwdconfirm.isValid).toBe(true);
    expect(signUpVs.isValid).toBe(true);
    expect(isEmail.mock.calls).toStrictEqual([['q.'], ['q@q.q'], ['a@a.a']]);
    expect(isEmailNotBusy.mock.calls).toStrictEqual([['q@q.q'], ['a@a.a']]);
    expect(areEqual.mock.calls).toStrictEqual([
      ['asdfg', ''],
      ['asdfg', 'asdfg'],
    ]);
  });
});
