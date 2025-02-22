/**
 * @jest-environment jsdom
 */
import { describe, it, expect } from '@jest/globals';
import { Validation } from '../../src/index.js';
import applyOutline from '../../src/ui/apply-outline.js';
import wait from '../../src/utils/wait.js';

describe('applyOutline', () => {
  it('should add an outline by validity', async () => {
    const inputElement = document.createElement('input');
    const isMeaningOfLife = (value) => value === '42';
    const v = Validation(inputElement)
      .constraint(isMeaningOfLife)
      .validated(applyOutline());

    expect(inputElement.style.outline).toBe('');

    inputElement.value = 23;
    await v.validate();
    await wait(4);
    expect(inputElement.style.outline).toBe('1px solid red');

    inputElement.value = 24;
    await v.validate();
    await wait(4);
    expect(inputElement.style.outline).toBe('1px solid red');

    inputElement.value = 42;
    await v.validate();
    await wait(4);
    expect(inputElement.style.outline).toBe('1px solid limegreen');

    inputElement.value = 21;
    await v.validate();
    await wait(4);
    expect(inputElement.style.outline).toBe('1px solid red');
  });

  it('should add an outline only when invalid', async () => {
    const inputElement = document.createElement('input');
    const isMeaningOfLife = (value) => value === '42';
    const outlines = { true: { value: '' }, false: { value: '1px solid red' } };
    const v = Validation(inputElement)
      .constraint(isMeaningOfLife)
      .validated(applyOutline(outlines));

    expect(inputElement.style.outline).toBe('');

    inputElement.value = 23;
    await v.validate();
    await wait(4);
    expect(inputElement.style.outline).toBe('1px solid red');

    inputElement.value = 24;
    await v.validate();
    await wait(4);
    expect(inputElement.style.outline).toBe('1px solid red');

    inputElement.value = 42;
    await v.validate();
    await wait(4);
    expect(inputElement.style.outline).toBe('');

    inputElement.value = 21;
    await v.validate();
    await wait(4);
    expect(inputElement.style.outline).toBe('1px solid red');

    inputElement.value = 42;
    await v.validate();
    await wait(4);
    expect(inputElement.style.outline).toBe('');
  });

  it('should add an outline only when valid', async () => {
    const inputElement = document.createElement('input');
    const isMeaningOfLife = (value) => value === '42';
    const outlines = {
      true: { value: '1px solid green' },
      false: { value: '' },
    };
    const v = Validation(inputElement)
      .constraint(isMeaningOfLife)
      .validated(applyOutline(outlines));

    expect(inputElement.style.outline).toBe('');

    inputElement.value = 23;
    await v.validate();
    await wait(4);
    expect(inputElement.style.outline).toBe('');

    inputElement.value = 24;
    await v.validate();
    await wait(4);
    expect(inputElement.style.outline).toBe('');

    inputElement.value = 42;
    await v.validate();
    await wait(4);
    expect(inputElement.style.outline).toBe('1px solid green');

    inputElement.value = 21;
    await v.validate();
    await wait(4);
    expect(inputElement.style.outline).toBe('');

    inputElement.value = 42;
    await v.validate();
    await wait(4);
    expect(inputElement.style.outline).toBe('1px solid green');
  });
});
