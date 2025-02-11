/**
 * @jest-environment jsdom
 */
import { describe, it, expect } from '@jest/globals';
import { Validation } from '../../src/index.js';
import applyAccess from '../../src/ui/apply-access.js';
import wait from '../../src/utils/wait.js';

describe('applyAccess', () => {
  it('should enable/disable an element by validity', async () => {
    const inputElement = document.createElement('input');
    const isMeaningOfLife = (value) => value === '42';
    const v = Validation(inputElement)
      .constraint(isMeaningOfLife)
      .validated(applyAccess());

    expect(inputElement.disabled).toBe(false);

    inputElement.value = 23;
    await v.validate();
    await wait(4);
    expect(inputElement.disabled).toBe(true);

    inputElement.value = 24;
    await v.validate();
    await wait(4);
    expect(inputElement.disabled).toBe(true);

    inputElement.value = 42;
    await v.validate();
    await wait(4);
    expect(inputElement.disabled).toBe(false);

    inputElement.value = 21;
    await v.validate();
    await wait(4);
    expect(inputElement.disabled).toBe(true);
  });

  it('should disable an element regardless of validity', async () => {
    const button = document.createElement('button');
    const inputElement = document.createElement('input');
    const isMeaningOfLife = (value) => value === '42';
    const outlines = { true: { value: true }, false: { value: true } };
    const v = Validation(inputElement)
      .constraint(isMeaningOfLife)
      .started(applyAccess(button, { disabled: true }))
      .validated(applyAccess(outlines));

    expect(inputElement.disabled).toBe(false);
    expect(button.disabled).toBe(false);

    inputElement.value = 23;
    await v.validate();
    await wait(4);
    expect(inputElement.disabled).toBe(true);
    expect(button.disabled).toBe(true);

    inputElement.value = 24;
    await v.validate();
    await wait(4);
    expect(inputElement.disabled).toBe(true);
    expect(button.disabled).toBe(true);

    inputElement.value = 42;
    await v.validate();
    await wait(4);
    expect(inputElement.disabled).toBe(true);
    expect(button.disabled).toBe(true);

    inputElement.value = 21;
    await v.validate();
    await wait(4);
    expect(inputElement.disabled).toBe(true);
    expect(button.disabled).toBe(true);

    inputElement.value = 42;
    await v.validate();
    await wait(4);
    expect(inputElement.disabled).toBe(true);
    expect(button.disabled).toBe(true);
  });

  it('should enable an element regardless of validity', async () => {
    const button = document.createElement('button');
    const inputElement = document.createElement('input');
    const isMeaningOfLife = (value) => value === '42';
    const outlines = {
      true: { value: false },
      false: { value: false },
    };
    const v = Validation(inputElement)
      .constraint(isMeaningOfLife)
      .started(applyAccess(button, { disabled: false }))
      .validated(applyAccess(outlines));

    inputElement.disabled = true;
    button.disabled = true;
    expect(inputElement.disabled).toBe(true);
    expect(button.disabled).toBe(true);

    inputElement.value = 23;
    await v.validate();
    await wait(4);
    expect(inputElement.disabled).toBe(false);
    expect(button.disabled).toBe(false);

    inputElement.value = 24;
    await v.validate();
    await wait(4);
    expect(inputElement.disabled).toBe(false);
    expect(button.disabled).toBe(false);

    inputElement.value = 42;
    await v.validate();
    await wait(4);
    expect(inputElement.disabled).toBe(false);
    expect(button.disabled).toBe(false);

    inputElement.value = 21;
    await v.validate();
    await wait(4);
    expect(inputElement.disabled).toBe(false);
    expect(button.disabled).toBe(false);

    inputElement.value = 42;
    await v.validate();
    await wait(4);
    expect(inputElement.disabled).toBe(false);
    expect(button.disabled).toBe(false);
  });
});
