import { it, expect, describe } from '@jest/globals';
import { IS_CLIENT, IS_SERVER } from '../../src/utils/getenv.js';
import ValidatedForm from '../../src/types/validated-form.js';

const fieldNames = ['firstName', 'lastName', 'email'];
const form = ValidatedForm('#form', fieldNames);

form.firstName.value = 'John';
form.lastName.value = 'Doe';
form.email.value = 'q@q.q';

describe('ValidatedForm', () => {
  it('should be server', () => {
    expect(IS_CLIENT).toBe(false);
    expect(IS_SERVER).toBe(true);
  });

  it('should give access to the form and its fields', () => {
    expect(form.firstName.name).toBe('firstName');
    expect(form.firstName.value).toBe('John');

    expect(form.lastName.name).toBe('lastName');
    expect(form.lastName.value).toBe('Doe');

    expect(form.email.name).toBe('email');
    expect(form.email.value).toBe('q@q.q');
  });

  it('should not throw an error', () => {
    expect(form.elements.firstName.value).not.toThrowError();

    expect(form.elements.lastName.value).not.toThrowError();

    expect(form.elements.email.value).not.toThrowError();

    expect(form.addEventListener()).not.toThrowError();

    expect(form.firstName.addEventListener()).not.toThrowError();
  });
});
