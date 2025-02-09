/**
 * @jest-environment jsdom
 */
import { describe, it, expect } from '@jest/globals';
import { Validation } from '../../src/index.js';
import applyClass from '../../src/ui/apply-class.js';
import wait from '../../src/utils/wait.js';

describe('applyClass', () => {
  it('should add a class name to the classList by validity', async () => {
    const inputElement = document.createElement('input');
    const isMeaningOfLife = (value) => value === '42';
    const v = Validation(inputElement)
      .constraint(isMeaningOfLife)
      .validated(applyClass());

    expect(inputElement.classList.contains('valid')).toBe(false);
    expect(inputElement.classList.contains('invalid')).toBe(false);

    inputElement.value = 23;
    await v.validate();
    await wait(4);
    expect(inputElement.classList.contains('valid')).toBe(false);
    expect(inputElement.classList.contains('invalid')).toBe(true);

    inputElement.value = 24;
    await v.validate();
    await wait(4);
    expect(inputElement.classList.contains('valid')).toBe(false);
    expect(inputElement.classList.contains('invalid')).toBe(true);

    inputElement.value = 42;
    await v.validate();
    await wait(4);
    expect(inputElement.classList.contains('valid')).toBe(true);
    expect(inputElement.classList.contains('invalid')).toBe(false);

    inputElement.value = 21;
    await v.validate();
    await wait(4);
    expect(inputElement.classList.contains('valid')).toBe(false);
    expect(inputElement.classList.contains('invalid')).toBe(true);
  });

  it('should add a class name only when invalid', async () => {
    const inputElement = document.createElement('input');
    const isMeaningOfLife = (value) => value === '42';
    const classNames = { true: { value: '' }, false: { value: 'invalid' } };
    const v = Validation(inputElement)
      .constraint(isMeaningOfLife)
      .validated(applyClass(classNames));

    expect(inputElement.classList.contains('valid')).toBe(false);
    expect(inputElement.classList.contains('invalid')).toBe(false);

    inputElement.value = 23;
    await v.validate();
    await wait(4);
    expect(inputElement.classList.contains('valid')).toBe(false);
    expect(inputElement.classList.contains('invalid')).toBe(true);

    inputElement.value = 24;
    await v.validate();
    await wait(4);
    expect(inputElement.classList.contains('valid')).toBe(false);
    expect(inputElement.classList.contains('invalid')).toBe(true);

    inputElement.value = 42;
    await v.validate();
    await wait(4);
    expect(inputElement.classList.contains('valid')).toBe(false);
    expect(inputElement.classList.contains('invalid')).toBe(false);

    inputElement.value = 21;
    await v.validate();
    await wait(4);
    expect(inputElement.classList.contains('valid')).toBe(false);
    expect(inputElement.classList.contains('invalid')).toBe(true);

    inputElement.value = 42;
    await v.validate();
    await wait(4);
    expect(inputElement.classList.contains('valid')).toBe(false);
    expect(inputElement.classList.contains('invalid')).toBe(false);
  });

  it('should add a class name only when valid', async () => {
    const inputElement = document.createElement('input');
    const isMeaningOfLife = (value) => value === '42';
    const classNames = { true: { value: 'valid' }, false: { value: '' } };
    const v = Validation(inputElement)
      .constraint(isMeaningOfLife)
      .validated(applyClass(classNames));

    expect(inputElement.classList.contains('valid')).toBe(false);
    expect(inputElement.classList.contains('invalid')).toBe(false);

    inputElement.value = 23;
    await v.validate();
    await wait(4);
    expect(inputElement.classList.contains('valid')).toBe(false);
    expect(inputElement.classList.contains('invalid')).toBe(false);

    inputElement.value = 24;
    await v.validate();
    await wait(4);
    expect(inputElement.classList.contains('valid')).toBe(false);
    expect(inputElement.classList.contains('invalid')).toBe(false);

    inputElement.value = 42;
    await v.validate();
    await wait(4);
    expect(inputElement.classList.contains('valid')).toBe(true);
    expect(inputElement.classList.contains('invalid')).toBe(false);

    inputElement.value = 21;
    await v.validate();
    await wait(4);
    expect(inputElement.classList.contains('valid')).toBe(false);
    expect(inputElement.classList.contains('invalid')).toBe(false);

    inputElement.value = 42;
    await v.validate();
    await wait(4);
    expect(inputElement.classList.contains('valid')).toBe(true);
    expect(inputElement.classList.contains('invalid')).toBe(false);
  });
});
