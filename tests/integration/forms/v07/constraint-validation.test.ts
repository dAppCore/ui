// SPDX-Licence-Identifier: EUPL-1.2
// Integration: <form>.checkValidity() walks v0.7 form-elements correctly.
import { describe, it, expect } from 'vitest';
import '../../../../src/forms';

describe('integration: Constraint Validation across v0.7 primitives', () => {
  it('<form>.checkValidity() returns false when a required <core-input> is empty', async () => {
    if (typeof HTMLElement.prototype.attachInternals !== 'function') return;
    const form = document.createElement('form');
    form.innerHTML = `<core-input name="email" type="email" required></core-input>`;
    document.body.appendChild(form);
    await new Promise((r) => requestAnimationFrame(r));
    expect(form.checkValidity()).toBe(false);
  });

  it('<form>.checkValidity() returns true when required <core-input> is filled', async () => {
    if (typeof HTMLElement.prototype.attachInternals !== 'function') return;
    const form = document.createElement('form');
    form.innerHTML = `<core-input name="email" type="email" required value="a@b.com"></core-input>`;
    document.body.appendChild(form);
    await new Promise((r) => requestAnimationFrame(r));
    expect(form.checkValidity()).toBe(true);
  });

  it('setCustomValidity propagates to <form>.checkValidity()', async () => {
    if (typeof HTMLElement.prototype.attachInternals !== 'function') return;
    const form = document.createElement('form');
    form.innerHTML = `<core-input name="email" value="a@b.com"></core-input>`;
    document.body.appendChild(form);
    await new Promise((r) => requestAnimationFrame(r));
    const input = form.querySelector('core-input') as any;
    input.setCustomValidity('Server says no');
    expect(form.checkValidity()).toBe(false);
    input.setCustomValidity('');
    expect(form.checkValidity()).toBe(true);
  });
});
