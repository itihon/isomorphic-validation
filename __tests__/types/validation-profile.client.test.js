/**
 * @jest-environment jsdom
 */
import { it, expect, describe } from '@jest/globals';
import { IS_CLIENT, IS_SERVER } from '../../src/utils/getenv.js';
import ValidationProfile from '../../src/types/validation-profile.js';

document.body.innerHTML = `
    <form id="form">
        <input type="text" name="firstName" value="John"></input>
        <input type="text" name="lastName" value="Doe"></input>
        <input type="email" name="email" value="q@q.q"></input>
    </form>
`;

const fieldNames = ['firstName', 'lastName', 'email'];
const anyData = { validations: ['someValidations'] };
const form = ValidationProfile('#form', fieldNames, anyData);

describe('ValidatedForm', () => {
  it('should be client', () => {
    expect(IS_CLIENT).toBe(true);
    expect(IS_SERVER).toBe(false);
  });

  it('should give access to the form and its fields', () => {
    expect(Object.prototype.toString.call(form.form)).toBe(
      '[object HTMLFormElement]',
    );

    expect(form.form.elements.firstName.value).toBe('John');

    expect(form.form.elements.lastName.value).toBe('Doe');

    expect(form.form.elements.email.value).toBe('q@q.q');
  });

  it('should give access to anyData', () => {
    expect(form.validations).toStrictEqual(['someValidations']);
  });

  it('should throw an error', () => {
    expect(() => ValidationProfile('#non existent selector')).toThrowError();
  });
});
