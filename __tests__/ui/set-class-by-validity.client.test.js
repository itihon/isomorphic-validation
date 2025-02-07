/**
 * @jest-environment jsdom
 */
import { describe, it, expect } from '@jest/globals';
import { Validation } from '../../src/index.js';
import setClassByValidity from '../../src/ui/set-class-by-validity.js';

describe('setClassByValidity', () => {
  it('should add a class name to the classList by validity', async () => {
    const inputElement = document.createElement('input');
    const isMeaningOfLife = (value) => value === '42';
    const v = Validation(inputElement)
      .constraint(isMeaningOfLife)
      .validated(setClassByValidity());

    expect(inputElement.classList.contains('valid')).toBe(false);
    expect(inputElement.classList.contains('invalid')).toBe(false);

    inputElement.value = 23;
    await v.validate();
    expect(inputElement.classList.contains('valid')).toBe(false);
    expect(inputElement.classList.contains('invalid')).toBe(true);

    inputElement.value = 24;
    await v.validate();
    expect(inputElement.classList.contains('valid')).toBe(false);
    expect(inputElement.classList.contains('invalid')).toBe(true);

    inputElement.value = 42;
    await v.validate();
    expect(inputElement.classList.contains('valid')).toBe(true);
    expect(inputElement.classList.contains('invalid')).toBe(false);

    inputElement.value = 21;
    await v.validate();
    expect(inputElement.classList.contains('valid')).toBe(false);
    expect(inputElement.classList.contains('invalid')).toBe(true);
  });

  it('should add a class name only when invalid', async () => {
    const inputElement = document.createElement('input');
    const isMeaningOfLife = (value) => value === '42';
    const classNames = { true: '', false: 'invalid' };
    const v = Validation(inputElement)
      .constraint(isMeaningOfLife)
      .validated(setClassByValidity(classNames));

    expect(inputElement.classList.contains('valid')).toBe(false);
    expect(inputElement.classList.contains('invalid')).toBe(false);

    inputElement.value = 23;
    await v.validate();
    expect(inputElement.classList.contains('valid')).toBe(false);
    expect(inputElement.classList.contains('invalid')).toBe(true);

    inputElement.value = 24;
    await v.validate();
    expect(inputElement.classList.contains('valid')).toBe(false);
    expect(inputElement.classList.contains('invalid')).toBe(true);

    inputElement.value = 42;
    await v.validate();
    expect(inputElement.classList.contains('valid')).toBe(false);
    expect(inputElement.classList.contains('invalid')).toBe(false);

    inputElement.value = 21;
    await v.validate();
    expect(inputElement.classList.contains('valid')).toBe(false);
    expect(inputElement.classList.contains('invalid')).toBe(true);

    inputElement.value = 42;
    await v.validate();
    expect(inputElement.classList.contains('valid')).toBe(false);
    expect(inputElement.classList.contains('invalid')).toBe(false);
  });

  it('should add a class name only when valid', async () => {
    const inputElement = document.createElement('input');
    const isMeaningOfLife = (value) => value === '42';
    const classNames = { true: 'valid', false: '' };
    const v = Validation(inputElement)
      .constraint(isMeaningOfLife)
      .validated(setClassByValidity(classNames));

    expect(inputElement.classList.contains('valid')).toBe(false);
    expect(inputElement.classList.contains('invalid')).toBe(false);

    inputElement.value = 23;
    await v.validate();
    expect(inputElement.classList.contains('valid')).toBe(false);
    expect(inputElement.classList.contains('invalid')).toBe(false);

    inputElement.value = 24;
    await v.validate();
    expect(inputElement.classList.contains('valid')).toBe(false);
    expect(inputElement.classList.contains('invalid')).toBe(false);

    inputElement.value = 42;
    await v.validate();
    expect(inputElement.classList.contains('valid')).toBe(true);
    expect(inputElement.classList.contains('invalid')).toBe(false);

    inputElement.value = 21;
    await v.validate();
    expect(inputElement.classList.contains('valid')).toBe(false);
    expect(inputElement.classList.contains('invalid')).toBe(false);

    inputElement.value = 42;
    await v.validate();
    expect(inputElement.classList.contains('valid')).toBe(true);
    expect(inputElement.classList.contains('invalid')).toBe(false);
  });
});
