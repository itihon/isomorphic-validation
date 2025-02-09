/**
 * @jest-environment jsdom
 */
import { describe, it, expect } from '@jest/globals';
import { Validation } from '../../src/index.js';
import applyBackground from '../../src/ui/apply-background.js';
import wait from '../../src/utils/wait.js';

describe('applyBackground', () => {
  it('should add a background by validity', async () => {
    const inputElement = document.createElement('input');
    const isMeaningOfLife = (value) => value === '42';
    const v = Validation(inputElement)
      .constraint(isMeaningOfLife)
      .validated(applyBackground());

    expect(inputElement.style.background).toBe('');

    inputElement.value = 23;
    await v.validate();
    await wait(4);
    expect(inputElement.style.background).toBe('lavenderblush');

    inputElement.value = 24;
    await v.validate();
    await wait(4);
    expect(inputElement.style.background).toBe('lavenderblush');

    inputElement.value = 42;
    await v.validate();
    await wait(4);
    expect(inputElement.style.background).toBe('honeydew');

    inputElement.value = 21;
    await v.validate();
    await wait(4);
    expect(inputElement.style.background).toBe('lavenderblush');
  });

  it('should add a background only when invalid', async () => {
    const inputElement = document.createElement('input');
    const isMeaningOfLife = (value) => value === '42';
    const outlines = { true: { value: '' }, false: { value: 'lavenderblush' } };
    const v = Validation(inputElement)
      .constraint(isMeaningOfLife)
      .validated(applyBackground(outlines));

    expect(inputElement.style.background).toBe('');

    inputElement.value = 23;
    await v.validate();
    await wait(4);
    expect(inputElement.style.background).toBe('lavenderblush');

    inputElement.value = 24;
    await v.validate();
    await wait(4);
    expect(inputElement.style.background).toBe('lavenderblush');

    inputElement.value = 42;
    await v.validate();
    await wait(4);
    expect(inputElement.style.background).toBe('');

    inputElement.value = 21;
    await v.validate();
    await wait(4);
    expect(inputElement.style.background).toBe('lavenderblush');

    inputElement.value = 42;
    await v.validate();
    await wait(4);
    expect(inputElement.style.background).toBe('');
  });

  it('should add a background only when valid', async () => {
    const inputElement = document.createElement('input');
    const isMeaningOfLife = (value) => value === '42';
    const outlines = {
      true: { value: 'honeydew' },
      false: { value: '' },
    };
    const v = Validation(inputElement)
      .constraint(isMeaningOfLife)
      .validated(applyBackground(outlines));

    expect(inputElement.style.background).toBe('');

    inputElement.value = 23;
    await v.validate();
    await wait(4);
    expect(inputElement.style.background).toBe('');

    inputElement.value = 24;
    await v.validate();
    await wait(4);
    expect(inputElement.style.background).toBe('');

    inputElement.value = 42;
    await v.validate();
    await wait(4);
    expect(inputElement.style.background).toBe('honeydew');

    inputElement.value = 21;
    await v.validate();
    await wait(4);
    expect(inputElement.style.background).toBe('');

    inputElement.value = 42;
    await v.validate();
    await wait(4);
    expect(inputElement.style.background).toBe('honeydew');
  });
});
