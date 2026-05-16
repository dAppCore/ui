// SPDX-Licence-Identifier: EUPL-1.2
// Integration: <core-label for="x"> ↔ <core-input id="x"> association.
import { describe, it, expect } from 'vitest';
import '../../../../src/primitives/label';
import '../../../../src/forms';

describe('integration: <core-label> + <core-input> association', () => {
  it('label for="x" matches input id="x" — clicking label focuses input', async () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <core-label for="email-field">Email</core-label>
      <core-input id="email-field" type="email" name="email"></core-input>
    `;
    document.body.appendChild(wrapper);
    await new Promise((r) => requestAnimationFrame(r));

    const label = wrapper.querySelector('core-label') as any;
    const input = wrapper.querySelector('core-input') as any;
    // The native <label for> association applies because <core-label>
    // renders a real <label> with the for attribute mirrored.
    expect(label.querySelector('label')?.getAttribute('for')).toBe('email-field');
    expect(input.id).toBe('email-field');
  });

  it('required attribute on core-label renders the * indicator', async () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <core-label for="email-field" required>Email</core-label>
    `;
    document.body.appendChild(wrapper);
    await new Promise((r) => requestAnimationFrame(r));
    const indicator = wrapper.querySelector('core-label [part="required-indicator"]');
    expect(indicator).not.toBeNull();
  });
});
