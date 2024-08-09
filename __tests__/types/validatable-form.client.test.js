/**
 * @jest-environment jsdom
 */
import { it, expect, describe } from '@jest/globals';
import { IS_CLIENT, IS_SERVER } from '../../src/utils/getenv.js';
import ValidatableForm from '../../src/types/validatable-form.js';

document.body.innerHTML = `
    <form id="form">
        <input type="text" name="firstName" value="John"></input>
        <input type="text" name="lastName" value="Doe"></input>
        <input type="email" name="email" value="q@q.q"></input>
    </form>
`;

const fieldNames = ['firstName', 'lastName', 'email'];
const form = ValidatableForm('#form', fieldNames);

describe('ValidatableForm', () => {
  it('should be a client', () => {
    expect(IS_CLIENT).toBe(true);
    expect(IS_SERVER).toBe(false);
  });

  it('should give access to the form and its fields', () => {
    expect(Object.prototype.toString.call(form)).toBe(
      '[object HTMLFormElement]',
    );

    expect(form.elements.firstName.name).toBe('firstName');
    expect(form.elements.firstName.value).toBe('John');

    expect(form.elements.lastName.name).toBe('lastName');
    expect(form.elements.lastName.value).toBe('Doe');

    expect(form.elements.email.name).toBe('email');
    expect(form.elements.email.value).toBe('q@q.q');
  });

  it('should throw an error', () => {
    expect(() => ValidatableForm('#non existent selector')).toThrowError();
  });
});
