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

  it('should validate through the middleware', async () => {
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

  it('should recreate a form fields structure by paths', async () => {
    const validations = [
      Validation(),
      Validation({}, 'value'),
      Validation({}, 'files.0'),
      Validation({}, 'files.1.size'),
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

    expect(validations[2].validate).toThrowError(
      `There is no path 'files.0' in object {}`,
    );

    expect(validations[3].validate).toThrowError(
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
