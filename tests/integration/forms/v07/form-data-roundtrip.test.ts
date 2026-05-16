// SPDX-Licence-Identifier: EUPL-1.2
// Integration: FormData picks up v0.7 form-element contributions.
import { describe, it, expect } from 'vitest';
import '../../../../src/forms';

describe('integration: <form> + v0.7 form primitives FormData roundtrip', () => {
  // All of these require ElementInternals — skipped under happy-dom (zero EI support).
  // Real-browser coverage lands in a Playwright sweep later.

  it('<core-input> contributes value to FormData when filled', async () => {
    if (typeof HTMLElement.prototype.attachInternals !== 'function') return;
    const form = document.createElement('form');
    form.innerHTML = `<core-input name="email" value="a@b.com"></core-input>`;
    document.body.appendChild(form);
    await new Promise((r) => requestAnimationFrame(r));
    const data = new FormData(form);
    expect(data.get('email')).toBe('a@b.com');
  });

  it('<core-checkbox> contributes when checked, omits when unchecked', async () => {
    if (typeof HTMLElement.prototype.attachInternals !== 'function') return;
    const form = document.createElement('form');
    form.innerHTML = `
      <core-checkbox name="terms" value="yes" checked></core-checkbox>
      <core-checkbox name="newsletter" value="yes"></core-checkbox>
    `;
    document.body.appendChild(form);
    await new Promise((r) => requestAnimationFrame(r));
    const data = new FormData(form);
    expect(data.get('terms')).toBe('yes');
    expect(data.get('newsletter')).toBeNull();
  });

  it('<core-radio-group> contributes selected value', async () => {
    if (typeof HTMLElement.prototype.attachInternals !== 'function') return;
    const form = document.createElement('form');
    form.innerHTML = `
      <core-radio-group name="plan" value="pro">
        <core-radio value="free">Free</core-radio>
        <core-radio value="pro">Pro</core-radio>
      </core-radio-group>
    `;
    document.body.appendChild(form);
    await new Promise((r) => requestAnimationFrame(r));
    const data = new FormData(form);
    expect(data.get('plan')).toBe('pro');
  });

  it('all primitives reset on form.reset()', async () => {
    if (typeof HTMLElement.prototype.attachInternals !== 'function') return;
    const form = document.createElement('form');
    form.innerHTML = `
      <core-input name="email" value="a@b.com"></core-input>
      <core-checkbox name="terms" value="yes" checked></core-checkbox>
    `;
    document.body.appendChild(form);
    await new Promise((r) => requestAnimationFrame(r));
    form.reset();
    await new Promise((r) => requestAnimationFrame(r));
    const input = form.querySelector('core-input') as any;
    const checkbox = form.querySelector('core-checkbox') as any;
    expect(input.value).toBe('');
    expect(checkbox.checked).toBe(false);
  });
});
