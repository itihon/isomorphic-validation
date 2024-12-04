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

const emailChangedCB = jest.fn();
const paswordChangedCB = jest.fn();
const pwdconfirmChangedCB = jest.fn();
const signupvsChangedCB = jest.fn();

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

[...signUpVs.validations].forEach((validation, idx) => {
  validation.client.changed(
    [emailChangedCB, paswordChangedCB, pwdconfirmChangedCB][idx],
  );
});

signUpVs.client.changed(signupvsChangedCB);

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
    expect(emailChangedCB).toBeCalledTimes(0);
    expect(paswordChangedCB).toBeCalledTimes(0);
    expect(pwdconfirmChangedCB).toBeCalledTimes(0);
    expect(signupvsChangedCB).toBeCalledTimes(0);

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
    expect(emailChangedCB).toBeCalledTimes(0);
    expect(paswordChangedCB).toBeCalledTimes(0);
    expect(pwdconfirmChangedCB).toBeCalledTimes(0);
    expect(signupvsChangedCB).toBeCalledTimes(0);

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
    expect(emailChangedCB).toBeCalledTimes(1);
    expect(paswordChangedCB).toBeCalledTimes(0);
    expect(pwdconfirmChangedCB).toBeCalledTimes(0);
    expect(signupvsChangedCB).toBeCalledTimes(0);

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
    expect(areEqual.mock.calls).toStrictEqual([
      ['asdfg', ''],
      ['asdfg', ''],
    ]); // glued, called twice
    expect(emailChangedCB).toBeCalledTimes(1);
    expect(paswordChangedCB).toBeCalledTimes(0);
    expect(pwdconfirmChangedCB).toBeCalledTimes(0);
    expect(signupvsChangedCB).toBeCalledTimes(0);

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
      // glued, called twice
      ['asdfg', ''],
      ['asdfg', ''],
      ['asdfg', 'asdfg'],
      ['asdfg', 'asdfg'],
    ]);
    expect(emailChangedCB).toBeCalledTimes(1);
    expect(paswordChangedCB).toBeCalledTimes(1);
    expect(pwdconfirmChangedCB).toBeCalledTimes(1); // !!! should be 1
    expect(signupvsChangedCB).toBeCalledTimes(1);
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
    expect(areEqual.mock.calls).toStrictEqual([
      ['asdfg', ''],
      ['asdfg', ''],
    ]); // glued, called twice

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
      // glued, called twice
      ['asdfg', ''],
      ['asdfg', ''],
      ['asdfg', 'asdfg'],
      ['asdfg', 'asdfg'],
    ]);
  });

  it('should call only client side methods and ignore server side', async () => {
    const cb1 = jest.fn();
    const cb2 = jest.fn();
    const cb3 = jest.fn();
    const cb4 = jest.fn();
    const cb5 = jest.fn();
    const cb6 = jest.fn();
    const cb7 = jest.fn();
    const cb8 = jest.fn();

    const predicate1 = jest.fn(() => true);
    const predicate2 = jest.fn(() => true);
    const predicate3 = jest.fn(() => true);
    const predicate4 = jest.fn(() => true);
    const predicate5 = jest.fn(() => true);
    const predicate6 = jest.fn(() => true);
    const predicate7 = jest.fn(() => true);
    const predicate8 = jest.fn(() => true);

    Object.entries({
      predicate1,
      predicate2,
      predicate3,
      predicate4,
      predicate5,
      predicate6,
      predicate7,
      predicate8,
    }).forEach(([key, value]) =>
      Object.defineProperty(value, 'name', { value: key }),
    );

    const [emailValidation] = signUpVs.validations;

    const getConstraintNames = (validation) =>
      [...validation.constraints.values()]
        .map((set) => [...set])
        .flat(3)
        .map((constraint) => constraint[Symbol.toStringTag]);

    let constraints = getConstraintNames(signUpVs);

    expect(constraints).toHaveLength(4);

    signUpVs
      .constraint(predicate1)
      .validated(cb1)
      .client.constraint(predicate2)
      .validated(cb2)
      .server.constraint(predicate3) // ignored
      .validated(cb3); // ignored

    signUpVs.client
      .constraint(predicate1)
      .validated(cb1)
      .constraint(predicate3)
      .validated(cb3)
      .server.constraint(predicate4) // ignored
      .validated(cb4); // ignored

    constraints = getConstraintNames(signUpVs);

    expect(constraints).toHaveLength(16);
    expect(constraints).toContain(predicate1.name);
    expect(constraints).toContain(predicate2.name);
    expect(constraints).toContain(predicate3.name);
    expect(constraints).not.toContain(predicate4.name);

    signUpForm.elements.email.value = 'a@a.a';
    await signUpVs.validate();

    expect(predicate1).toHaveBeenCalledTimes(6);
    expect(predicate2).toHaveBeenCalledTimes(3);
    expect(predicate3).toHaveBeenCalledTimes(3);
    expect(predicate4).toHaveBeenCalledTimes(0);

    expect(cb1).toHaveBeenCalledTimes(2);
    expect(cb2).toHaveBeenCalledTimes(1);
    expect(cb3).toHaveBeenCalledTimes(1);
    expect(cb4).toHaveBeenCalledTimes(0);

    signUpVs.email
      .constraint(predicate5)
      .validated(cb5)
      .client.constraint(predicate6)
      .validated(cb6)
      .server.constraint(predicate7) // ignored
      .validated(cb7) // ignored
      .client.constraint(predicate7)
      .validated(cb7);

    signUpVs.email.client
      .constraint(predicate6)
      .validated(cb6)
      .server.constraint(predicate5) // ignored
      .validated(cb5); // ignored

    emailValidation.client
      .constraint(predicate6)
      .validated(cb6)
      .server.constraint(predicate8) // ignored
      .validated(cb8) // ignored
      .client.constraint(predicate7)
      .validated(cb7)
      .client.constraint(predicate7)
      .validated(cb7);

    constraints = getConstraintNames(signUpVs);

    expect(constraints).toHaveLength(23);
    expect(constraints).toContain(predicate5.name);
    expect(constraints).toContain(predicate6.name);
    expect(constraints).toContain(predicate7.name);
    expect(constraints).not.toContain(predicate8.name);

    await signUpVs.validate();

    expect(predicate5).toHaveBeenCalledTimes(1);
    expect(predicate6).toHaveBeenCalledTimes(3);
    expect(predicate7).toHaveBeenCalledTimes(3);
    expect(predicate8).toHaveBeenCalledTimes(0);

    expect(cb5).toHaveBeenCalledTimes(1);
    expect(cb6).toHaveBeenCalledTimes(3);
    expect(cb7).toHaveBeenCalledTimes(3);
    expect(cb8).toHaveBeenCalledTimes(0);
  });

  it('should print a warning for calling the .dataMapper method on the client side', () => {
    const spyWarn = jest
      .spyOn(global.console, 'warn')
      .mockImplementation(() => {});

    emailV.dataMapper();

    expect(spyWarn.mock.calls).toStrictEqual([
      ['The dataMapper method does nothing on the client side'],
    ]);

    signUpVs.dataMapper();

    expect(spyWarn.mock.calls).toStrictEqual([
      ['The dataMapper method does nothing on the client side'],
      ['The dataMapper method does nothing on the client side'],
    ]);

    spyWarn.mockRestore();
  });

  it('should validate via eventHandler before creating a profile', async () => {
    e.target = signUpForm.elements.email;

    await expect(emailV(e)).rejects.toThrow();
    expect((await emailV()).isValid).toBe(false);

    emailV.bind(signUpForm.elements.email);
    signUpForm.elements.email.value = 'q@q.q';

    await emailV(e);
    expect(emailV.isValid).toBe(true);
  });
});
