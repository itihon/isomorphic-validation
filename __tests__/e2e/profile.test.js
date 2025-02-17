import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Predicate, Validation } from '../../src/index.js';
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

signUpProfile.validation.email.constraint(isEmailNotBusy, { debounce: 100 });
signInProfile.validation.password.constraint(isOnlyLetters);

const signInForm = signInProfile.form;
const signUpForm = signUpProfile.form;

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

  it('should normalize to array the second and third parameter', () => {
    expect(() => Validation.profile('', 'fieldName', emailV)).not.toThrow();

    expect(() => Validation.profile()).not.toThrow();

    expect(() => Validation.profile('', undefined, emailV)).not.toThrow();
  });

  it('should implement iterator protocol', () => {
    const [signInF, signInV] = Validation.profile(
      '#signin',
      ['email', 'password'],
      [emailV, passwordV],
    );

    expect(Object.hasOwn({ ...signInF }, 'email')).toBe(true);
    expect(Object.hasOwn({ ...signInF }, 'password')).toBe(true);
    expect(Object.hasOwn({ ...signInF }, 'passwordX')).toBe(false);

    expect(signInV).toHaveProperty('email');
    expect(signInV).toHaveProperty('password');
    expect(signInV).not.toHaveProperty('passwordX');
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

    expect(isEmail.mock.calls).toStrictEqual([[email]]);
    expect(isLongerThan(4).mock.calls).toStrictEqual([[email], [password]]);
    expect(isShorterThan(45).mock.calls).toStrictEqual([[email]]);
    expect(isShorterThan(25).mock.calls).toStrictEqual([[password]]);
    expect(isOnlyLetters.mock.calls).toStrictEqual([[password]]);
    expect(isEmailNotBusy.mock.calls).toStrictEqual([]); // was not called, because equal to the initial value
    expect(areEqual.mock.calls).toStrictEqual([]); // !glued predicate is called 4 times. One call is enough. UPD: was not called, because equal to the initial value

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
      [password, password],
      [password, password],
    ]); // !glued predicate is called 4 times. One call is enough

    expect(signInVs.isValid).toBe(false);
    expect(signUpVs.isValid).toBe(true);
  });

  it('should validate via the middleware', async () => {
    const req = { body: undefined };

    expect(signInVs.isValid).toBe(false);
    expect(signUpVs.isValid).toBe(false);

    req.body = { email: 'a@a.a', password: 'asdfg', pwdconfirm: '' };

    await signInVs(req, {}, () => {});
    await signUpVs(req, {}, () => {});
    expect(signInVs.isValid).toBe(true);
    expect(signUpVs.isValid).toBe(false);

    req.body = { email: 'a@a.a', password: 'asdfg123', pwdconfirm: 'asdfg123' };

    await signInVs(req, {}, () => {});
    await signUpVs(req, {}, () => {});
    expect(signInVs.isValid).toBe(false);
    expect(signUpVs.isValid).toBe(true);

    req.body = { email: 'a@a.a', password: 'asdfg', pwdconfirm: 'asdfg' };

    await signInVs(req, {}, () => {});
    await signUpVs(req, {}, () => {});
    expect(signInVs.isValid).toBe(true);
    expect(signUpVs.isValid).toBe(true);

    req.body = { email: 'q@q.q', password: 'asdfg1', pwdconfirm: 'asdfg1' };

    await signInVs.email(req, {}, () => {});
    await signInVs.password(req, {}, () => {});

    await signUpVs.email(req, {}, () => {});
    await signUpVs.password(req, {}, () => {});
    await signUpVs.pwdconfirm(req, {}, () => {});

    expect(signInVs.email.isValid).toBe(true);
    expect(signInVs.password.isValid).toBe(false);

    expect(signUpVs.email.isValid).toBe(false);
    expect(signUpVs.password.isValid).toBe(true);
    expect(signUpVs.pwdconfirm.isValid).toBe(true);

    expect(signInVs.isValid).toBe(false);
    expect(signUpVs.isValid).toBe(false);

    req.body = { email: 'b@b.b', password: 'asdfg', pwdconfirm: 'asdfg1' };

    await signInVs.email(req, {}, () => {});
    await signInVs.password(req, {}, () => {});

    await signUpVs.email(req, {}, () => {});
    await signUpVs.password(req, {}, () => {});
    await signUpVs.pwdconfirm(req, {}, () => {});

    expect(signInVs.email.isValid).toBe(true);
    expect(signInVs.password.isValid).toBe(true);

    expect(signUpVs.email.isValid).toBe(true);
    expect(signUpVs.password.isValid).toBe(false);
    expect(signUpVs.pwdconfirm.isValid).toBe(false);

    expect(signInVs.isValid).toBe(true);
    expect(signUpVs.isValid).toBe(false);

    req.body = { email: 'b@b.b', password: 'asdfg1', pwdconfirm: 'asdfg1' };

    await signInVs.email(req, {}, () => {});
    await signInVs.password(req, {}, () => {});

    await signUpVs.email(req, {}, () => {});
    await signUpVs.password(req, {}, () => {});
    await signUpVs.pwdconfirm(req, {}, () => {});

    expect(signInVs.email.isValid).toBe(true);
    expect(signInVs.password.isValid).toBe(false);

    expect(signUpVs.email.isValid).toBe(true);
    expect(signUpVs.password.isValid).toBe(true);
    expect(signUpVs.pwdconfirm.isValid).toBe(true);

    expect(signInVs.isValid).toBe(false);
    expect(signUpVs.isValid).toBe(true);
  });

  it('should validate using a data mapper', async () => {
    const signInMapper = (req, form) => {
      form.email.value = req.body.signin.login;
      form.password.value = req.body.signin.pwd;
    };

    const emailMapper = (req, form) => {
      form.email.value = req.body.login;
    };

    signInVs.email.dataMapper(emailMapper);
    signInVs.dataMapper(signInMapper);

    let req = { body: { signin: { login: 'q@q.', pwd: 'zxcvb' } } };
    await signInVs(req, {}, () => {});
    expect(isEmail.mock.calls).toStrictEqual([['q@q.']]);
    expect(isLongerThan(4).mock.calls).toStrictEqual([['q@q.'], ['zxcvb']]);
    expect(signInVs.isValid).toBe(false);

    req = { body: { signin: { login: 'q@q.q', pwd: 'zxcvb' } } };
    await signInVs(req, {}, () => {});
    expect(isEmail.mock.calls).toStrictEqual([['q@q.'], ['q@q.q']]);
    expect(isLongerThan(4).mock.calls).toStrictEqual([
      ['q@q.'],
      ['zxcvb'],
      ['q@q.q'],
      ['zxcvb'],
    ]);
    expect(signInVs.isValid).toBe(true);

    req = { body: { login: 'q@q.q.', pwd: 'zxcvbx' } };
    await signInVs.email(req, {}, () => {});
    expect(isEmail.mock.calls).toStrictEqual([['q@q.'], ['q@q.q'], ['q@q.q.']]);
    expect(isLongerThan(4).mock.calls).toStrictEqual([
      ['q@q.'],
      ['zxcvb'],
      ['q@q.q'],
      ['zxcvb'],
      ['q@q.q.'],
    ]);
    expect(signInVs.isValid).toBe(false);
  });

  it('should throw an error for calling the .dataMapper method before creating a profile', () => {
    expect(emailV.dataMapper).toThrow();
  });

  it('should throw an error for passing not a function to the .dataMapper method', () => {
    expect(signInVs.dataMapper).toThrow();
  });

  it('should throw an error for using a validation as a middleware before creating a profile', () => {
    const req = { body: { login: 'q@q.q.', pwd: 'zxcvbx' } };
    expect(() => emailV(req, {}, () => {})).toThrow();
  });

  it('should throw an error if a form field is not a string', () => {
    const err = 'Form field name must be a not empty string.';

    expect(() => Validation.profile('', ['', 'asdf'], emailV)).toThrowError(
      err,
    );

    expect(() => Validation.profile('', '', emailV)).toThrowError(err);

    expect(() => Validation.profile('', null, emailV)).toThrowError(err);

    expect(() => Validation.profile('', {}, emailV)).toThrowError(err);

    expect(() => Validation.profile('', 42, emailV)).toThrowError(err);
  });

  it('should throw an error if not a Validation was passed in', () => {
    const err = 'Not a Validation was passed in';

    expect(() => Validation.profile('', 'asdf', null)).toThrowError(err);

    expect(() => Validation.profile('', 'asdf', [null, emailV])).toThrowError(
      err,
    );
  });

  it('should call only server side methods and ignore client side', async () => {
    const cb1 = jest.fn();
    const cb2 = jest.fn();
    const cb3 = jest.fn();
    const cb4 = jest.fn();
    const cb5 = jest.fn();
    const cb6 = jest.fn();
    const cb7 = jest.fn();
    const cb8 = jest.fn();
    const cb9 = jest.fn();

    const predicate1 = jest.fn(() => true);
    const predicate2 = jest.fn(() => true);
    const predicate3 = jest.fn(() => true);
    const predicate4 = jest.fn(() => true);
    const predicate5 = jest.fn(() => true);
    const predicate6 = jest.fn(() => true);
    const predicate7 = jest.fn(() => true);
    const predicate8 = jest.fn(() => true);
    const predicate9 = jest.fn(() => true);

    const mapper1 = jest.fn();
    const mapper2 = jest.fn();

    const cb = jest.fn();

    Object.entries({
      predicate1,
      predicate2,
      predicate3,
      predicate4,
      predicate5,
      predicate6,
      predicate7,
      predicate8,
      predicate9,
    }).forEach(([key, value]) =>
      Object.defineProperty(value, 'name', { value: key }),
    );

    const [emailValidation] = signInVs.validations;

    const getConstraintNames = (validation) =>
      [...validation.constraints.values()]
        .map((set) => [...set])
        .flat(3)
        .map((constraint) => constraint[Symbol.toStringTag]);

    let constraints = getConstraintNames(signInVs);

    expect(constraints).toHaveLength(6);

    emailValidation.constraint(Predicate(predicate9).client.validated(cb9));

    signInVs
      .constraint(predicate1)
      .validated(cb1)
      .client.constraint(predicate2) // ignored
      .validated(cb2) // ignored
      .server.constraint(predicate3)
      .validated(cb3);

    signInVs.client
      .constraint(predicate1) // ignored
      .validated(cb1) // ignored
      .constraint(predicate3) // ignored
      .validated(cb3) // ignored
      .server.constraint(predicate4)
      .validated(cb4);

    signInVs.client.validations.forEach(cb); // ignored

    constraints = getConstraintNames(signInVs);

    expect(cb).toHaveBeenCalledTimes(0);
    expect(constraints).toHaveLength(13);
    expect(constraints).toContain(predicate1.name);
    expect(constraints).toContain(predicate3.name);
    expect(constraints).toContain(predicate4.name);
    expect(constraints).not.toContain(predicate2.name);

    signInForm.email.value = 'a@a.a';
    signInForm.password.value = 'asdfg';

    await signInVs.validate();

    expect(predicate1).toHaveBeenCalledTimes(2);
    expect(predicate3).toHaveBeenCalledTimes(2);
    expect(predicate4).toHaveBeenCalledTimes(2);
    expect(predicate2).toHaveBeenCalledTimes(0);

    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb3).toHaveBeenCalledTimes(1);
    expect(cb4).toHaveBeenCalledTimes(1);
    expect(cb2).toHaveBeenCalledTimes(0);

    signInVs.email
      .constraint(predicate5)
      .validated(cb5)
      .client.constraint(predicate6) // ignored
      .validated(cb6) // ignored
      .server.constraint(predicate7)
      .validated(cb7)
      .client.constraint(predicate7) // ignored
      .validated(cb7); // ignored

    signInVs.email.client
      .constraint(predicate6) // ignored
      .validated(cb6) // ignored
      .server.constraint(predicate5)
      .validated(cb5);

    emailValidation.client
      .constraint(predicate6) // ignored
      .validated(cb6) // ignored
      .server.constraint(predicate8)
      .validated(cb8)
      .client.constraint(predicate7) // ignored
      .validated(cb7) // ignored
      .client.constraint(predicate7) // ignored
      .validated(cb7); // ignored

    constraints = getConstraintNames(signInVs);

    expect(constraints).toHaveLength(17);
    expect(constraints).toContain(predicate5.name);
    expect(constraints).toContain(predicate7.name);
    expect(constraints).toContain(predicate8.name);
    expect(constraints).toContain(predicate9.name);
    expect(constraints).not.toContain(predicate6.name);

    await signInVs.validate();

    expect(predicate5).toHaveBeenCalledTimes(2);
    expect(predicate7).toHaveBeenCalledTimes(1);
    expect(predicate8).toHaveBeenCalledTimes(1);
    expect(predicate9).toHaveBeenCalledTimes(2);
    expect(predicate6).toHaveBeenCalledTimes(0);

    expect(cb5).toHaveBeenCalledTimes(2);
    expect(cb7).toHaveBeenCalledTimes(1);
    expect(cb8).toHaveBeenCalledTimes(1);
    expect(cb6).toHaveBeenCalledTimes(0);

    // addressing .dataMapper and calling middleware
    signInVs.client
      .dataMapper(mapper1) // ignored
      .server.dataMapper(mapper2);

    signInVs.server({ body: { email: {}, password: {} } }, {}, () => {});
    expect(mapper1).toBeCalledTimes(0);
    expect(mapper2).toBeCalledTimes(1);

    signInVs.email.server.dataMapper(mapper1).client.dataMapper(mapper2); // ignored

    signInVs.server.email({ body: { email: {}, password: {} } }, {}, () => {});
    expect(mapper1).toBeCalledTimes(1);
    expect(mapper2).toBeCalledTimes(1);

    signInVs.email.isomorphic(
      { body: { email: {}, password: {} } },
      {},
      () => {},
    );
    expect(mapper1).toBeCalledTimes(2);
    expect(mapper2).toBeCalledTimes(1);
  });

  it('should validate by target', async () => {
    let vr; // ValidationResult
    const checkTargetStateCB = jest.fn();

    signInVs.validated(checkTargetStateCB);
    signUpVs.validated(checkTargetStateCB);

    signInForm.email.value = 'a@a.a';
    signInForm.password.value = 'asdfg';

    signUpForm.email.value = 'b@b.b';
    signUpForm.password.value = 'asdfg1';
    signUpForm.pwdconfirm.value = 'asdfg1';

    expect((vr = await signInVs.validate(signInForm.email)).isValid).toBe(true);
    expect(vr.target).toBe(signInForm.email);
    expect(checkTargetStateCB.mock.lastCall[0].target).toBe(signInForm.email);
    expect(isEmail.mock.calls).toStrictEqual([['a@a.a']]);
    expect((vr = await signInVs.validate(signInForm.password)).isValid).toBe(
      true,
    );
    expect(vr.target).toBe(signInForm.password);
    expect(checkTargetStateCB.mock.lastCall[0].target).toBe(
      signInForm.password,
    );
    expect(isLongerThan(4).mock.calls).toStrictEqual([['a@a.a'], ['asdfg']]);
    expect(signInVs.isValid).toBe(true);

    expect((vr = await signUpVs.validate(signUpForm.email)).isValid).toBe(true);
    expect(vr.target).toBe(signUpForm.email);
    expect(checkTargetStateCB.mock.lastCall[0].target).toBe(signUpForm.email);
    expect(isEmail.mock.calls).toStrictEqual([['a@a.a'], ['b@b.b']]);
    expect((vr = await signUpVs.validate(signUpForm.password)).isValid).toBe(
      true,
    );
    expect(vr.target).toBe(signUpForm.password);
    expect(checkTargetStateCB.mock.lastCall[0].target).toBe(
      signUpForm.password,
    );
    // glued, called twice
    expect(areEqual.mock.calls).toStrictEqual([
      ['asdfg1', 'asdfg1'],
      ['asdfg1', 'asdfg1'],
    ]);
    expect((vr = await signUpVs.validate(signUpForm.pwdconfirm)).isValid).toBe(
      true,
    );
    expect(vr.target).toBe(signUpForm.pwdconfirm);
    expect(checkTargetStateCB.mock.lastCall[0].target).toBe(
      signUpForm.pwdconfirm,
    );
    // glued, called twice
    expect(areEqual.mock.calls).toStrictEqual([
      ['asdfg1', 'asdfg1'],
      ['asdfg1', 'asdfg1'],
      ['asdfg1', 'asdfg1'],
      ['asdfg1', 'asdfg1'],
    ]);
    expect(signUpVs.isValid).toBe(true);

    signInForm.email.value = 'c@c.c';
    signInForm.password.value = 'asdfg#';

    signUpForm.email.value = 'q@q.q';
    signUpForm.password.value = 'asdfg2';
    signUpForm.pwdconfirm.value = 'asdfg2';

    expect((await signInVs.validate(signInForm.email)).isValid).toBe(true);
    expect(isEmail.mock.calls).toStrictEqual([['a@a.a'], ['b@b.b'], ['c@c.c']]);
    expect((await signInVs.validate(signInForm.password)).isValid).toBe(false);
    expect(isLongerThan(4).mock.calls).toStrictEqual([
      ['a@a.a'],
      ['asdfg'],
      ['b@b.b'],
      ['asdfg1'],
      ['asdfg1'],
      ['c@c.c'],
      ['asdfg#'],
    ]);
    expect(signInVs.isValid).toBe(false);

    expect((await signUpVs.validate(signUpForm.email)).isValid).toBe(false);
    expect(isEmail.mock.calls).toStrictEqual([
      ['a@a.a'],
      ['b@b.b'],
      ['c@c.c'],
      ['q@q.q'],
    ]);
    expect((await signUpVs.validate(signUpForm.password)).isValid).toBe(true);
    // glued, called twice
    expect(areEqual.mock.calls).toStrictEqual([
      ['asdfg1', 'asdfg1'],
      ['asdfg1', 'asdfg1'],
      ['asdfg1', 'asdfg1'],
      ['asdfg1', 'asdfg1'],
      ['asdfg2', 'asdfg2'],
      ['asdfg2', 'asdfg2'],
    ]);
    expect((await signUpVs.validate(signUpForm.pwdconfirm)).isValid).toBe(true);
    // glued, called twice
    expect(areEqual.mock.calls).toStrictEqual([
      ['asdfg1', 'asdfg1'],
      ['asdfg1', 'asdfg1'],
      ['asdfg1', 'asdfg1'],
      ['asdfg1', 'asdfg1'],
      ['asdfg2', 'asdfg2'],
      ['asdfg2', 'asdfg2'],
      ['asdfg2', 'asdfg2'],
      ['asdfg2', 'asdfg2'],
    ]);
    expect(signUpVs.isValid).toBe(false);

    // wrong target
    await expect(signUpVs.validate(signInForm.password)).rejects.toThrow();
    await expect(signInVs.validate(signUpForm.email)).rejects.toThrow();
  });

  it('should recreate a form fields structure by paths', async () => {
    const toString = () => '';
    const validations = [
      Validation(),
      Validation({}, { path: 'value' }),
      Validation({}, { path: 'files.0', initValue: { toString } }),
      Validation({}, { path: 'files.1.size', initValue: 0 }),
    ].map((v) => v.constraint(isLongerThan(1)));

    const { form, validation } = Validation.profile(
      '#testForm',
      validations.map((_, idx) => `field${idx}`),
      validations,
    );

    expect(Object.hasOwn(form.field0, 'value')).toBe(true);
    expect(Object.hasOwn(form.field1, 'value')).toBe(true);
    expect(Object.hasOwn(form.field2.files, '0')).toBe(true);
    expect(Object.hasOwn(form.field3.files[1], 'size')).toBe(true);

    // initial values
    expect(form.field0.value).toBe('');
    expect(form.field1.value).toBe('');
    expect(form.field2.files[0]).toStrictEqual({ toString });
    expect(form.field3.files[1].size).toBe(0);

    await expect(validations[2].validate()).rejects.toThrowError(
      `There is no path 'files.0' in object {}`,
    );

    await expect(validations[3].validate()).rejects.toThrowError(
      `There is no path 'files.1.size' in object {}`,
    );

    expect(
      (await Promise.all(validation.validations.map((v) => v.validate()))).map(
        (res) => res.isValid,
      ),
    ).toStrictEqual([false, false, false, false]);

    form.field0.value = 42;
    form.field1.value = 0;
    form.field2.files[0] = 0;
    form.field3.files[1].size = 0;
    expect(
      (await Promise.all(validation.validations.map((v) => v.validate()))).map(
        (res) => res.isValid,
      ),
    ).toStrictEqual([true, false, false, false]);

    form.field0.value = 0;
    form.field1.value = 42;
    form.field2.files[0] = 0;
    form.field3.files[1].size = 0;
    expect(
      (await Promise.all(validation.validations.map((v) => v.validate()))).map(
        (res) => res.isValid,
      ),
    ).toStrictEqual([false, true, false, false]);

    form.field0.value = 0;
    form.field1.value = 0;
    form.field2.files[0] = 42;
    form.field3.files[1].size = 0;
    expect(
      (await Promise.all(validation.validations.map((v) => v.validate()))).map(
        (res) => res.isValid,
      ),
    ).toStrictEqual([false, false, true, false]);

    form.field0.value = 0;
    form.field1.value = 0;
    form.field2.files[0] = 0;
    form.field3.files[1].size = 42;
    expect(
      (await Promise.all(validation.validations.map((v) => v.validate()))).map(
        (res) => res.isValid,
      ),
    ).toStrictEqual([false, false, false, true]);

    expect((await validation.validate(form.field0)).isValid).toBe(false);
    expect((await validation.validate(form.field1)).isValid).toBe(false);
    expect((await validation.validate(form.field2)).isValid).toBe(false);
    expect((await validation.validate(form.field3)).isValid).toBe(true);
  });
});
