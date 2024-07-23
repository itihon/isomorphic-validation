import { it, expect, describe } from '@jest/globals';
import { IS_CLIENT, IS_SERVER } from '../../src/utils/getenv.js';
import ValidationProfile from '../../src/types/validation-profile.js';

const fieldNames = ['firstName', 'lastName', 'email'];
const anyData = { validations: ['someValidations'] };
const form = ValidationProfile('#form', fieldNames, anyData);

form.form.firstName.value = 'John';
form.form.lastName.value = 'Doe';
form.form.email.value = 'q@q.q';

describe('ValidatedForm', () => {
  it('should be server', () => {
    expect(IS_CLIENT).toBe(false);
    expect(IS_SERVER).toBe(true);
  });

  it('should give access to the form and its fields', () => {
    expect(form.form.firstName.value).toBe('John');

    expect(form.form.lastName.value).toBe('Doe');

    expect(form.form.email.value).toBe('q@q.q');
  });

  it('should not throw an error', () => {
    expect(form.form.elements.firstName.value).not.toThrowError();

    expect(form.form.elements.lastName.value).not.toThrowError();

    expect(form.form.elements.email.value).not.toThrowError();

    expect(form.form.addEventListener()).not.toThrowError();

    expect(form.form.firstName.addEventListener()).not.toThrowError();
  });

  it('should give access to anyData', () => {
    expect(form.validations).toStrictEqual(['someValidations']);
  });
});
