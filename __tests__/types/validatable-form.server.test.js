import { it, expect, describe } from '@jest/globals';
import { IS_CLIENT, IS_SERVER } from '../../src/utils/getenv.js';
import ValidatableForm from '../../src/types/validatable-form.js';

const fieldNames1 = ['firstName', 'lastName', 'email'];
const form1 = ValidatableForm('#form', fieldNames1);

const fieldNames2 = ['productImage', 'productIcon'];
const paths2 = ['files.0.size', 'files.1.type'];
const form2 = ValidatableForm('#form', fieldNames2, paths2);

describe('ValidatableForm', () => {
  it('should be server', () => {
    expect(IS_CLIENT).toBe(false);
    expect(IS_SERVER).toBe(true);
  });

  it('should give access to the form and its fields', () => {
    expect(Object.hasOwn(form1.firstName, 'value')).toBe(true);
    expect(Object.hasOwn(form1.lastName, 'value')).toBe(true);
    expect(Object.hasOwn(form1.email, 'value')).toBe(true);

    form1.firstName.value = 'John';
    form1.lastName.value = 'Doe';
    form1.email.value = 'q@q.q';

    expect(form1.firstName.name).toBe('firstName');
    expect(form1.firstName.value).toBe('John');

    expect(form1.lastName.name).toBe('lastName');
    expect(form1.lastName.value).toBe('Doe');

    expect(form1.email.name).toBe('email');
    expect(form1.email.value).toBe('q@q.q');
  });

  it('should give access to the form fields with nested paths', () => {
    expect(Object.hasOwn(form2.productImage, 'files')).toBe(true);
    expect(Object.hasOwn(form2.productIcon, 'files')).toBe(true);

    expect(Object.hasOwn(form2.productImage.files[0], 'size')).toBe(true);
    expect(Object.hasOwn(form2.productIcon.files[1], 'type')).toBe(true);

    expect(form2.productImage.name).toBe('productImage');
    expect(form2.productIcon.name).toBe('productIcon');

    expect(typeof form2.productImage.files[0].size).toBe('string');
    expect(typeof form2.productIcon.files[1].type).toBe('string');
  });

  it('should not throw an error', () => {
    expect(() => form1.elements.firstName.value).not.toThrowError();

    expect(() => form1.elements.lastName.value).not.toThrowError();

    expect(() => form1.elements.email.value).not.toThrowError();

    expect(() => form1.addEventListener()).not.toThrowError();

    expect(() => form1.firstName.addEventListener()).not.toThrowError();

    expect(() => form1.elements.lastName.addEventListener()).not.toThrowError();
  });
});
