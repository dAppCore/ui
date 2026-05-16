// SPDX-Licence-Identifier: EUPL-1.2
// AX rule: each test is a copy-pastable usage example for the primitive.
import { describe, it, expect } from 'vitest';
import '.';

describe('@dappcore/ui/forms — v0.7 usage examples', () => {
  it('example: <core-input> email field inside a form', async () => {
    const form = document.createElement('form');
    form.innerHTML = `
      <core-input type="email" name="email" required leading-icon="search">
        <span slot="hint">Your work email</span>
      </core-input>
    `;
    document.body.appendChild(form);
    await new Promise((r) => requestAnimationFrame(r));
    expect(form.querySelector('core-input')).not.toBeNull();
  });

  it('example: <core-textarea> with maxlength + hint', async () => {
    const el = document.createElement('div');
    el.innerHTML = `
      <core-textarea name="bio" rows="4" maxlength="500">
        <span slot="hint">Up to 500 characters.</span>
      </core-textarea>
    `;
    document.body.appendChild(el);
    await new Promise((r) => requestAnimationFrame(r));
    expect(el.querySelector('core-textarea')).not.toBeNull();
  });

  it('example: <core-select> with slotted options', async () => {
    const form = document.createElement('form');
    form.innerHTML = `
      <core-select name="plan" required>
        <option value="">— Choose —</option>
        <option value="free">Free</option>
        <option value="pro">Pro</option>
        <option value="enterprise">Enterprise</option>
      </core-select>
    `;
    document.body.appendChild(form);
    await new Promise((r) => requestAnimationFrame(r));
    expect(form.querySelector('core-select')).not.toBeNull();
  });

  it('example: <core-checkbox> with label + required', async () => {
    const form = document.createElement('form');
    form.innerHTML = `
      <core-checkbox name="terms" required>
        I accept the <a href="/tos">terms of service</a>
      </core-checkbox>
    `;
    document.body.appendChild(form);
    await new Promise((r) => requestAnimationFrame(r));
    expect(form.querySelector('core-checkbox')).not.toBeNull();
  });

  it('example: <core-radio> children inside <core-radio-group>', async () => {
    const form = document.createElement('form');
    form.innerHTML = `
      <core-radio-group name="plan" value="pro" required>
        <core-radio value="free">Free</core-radio>
        <core-radio value="pro">Pro</core-radio>
        <core-radio value="enterprise">Enterprise</core-radio>
        <span slot="hint">Choose a plan.</span>
      </core-radio-group>
    `;
    document.body.appendChild(form);
    await new Promise((r) => requestAnimationFrame(r));
    expect(form.querySelector('core-radio-group')).not.toBeNull();
    expect(form.querySelectorAll('core-radio')).toHaveLength(3);
  });

  it('example: <core-form> wraps v0.7 inputs with secure-by-default infra', async () => {
    const el = document.createElement('div');
    el.innerHTML = `
      <core-form action="/v1/users" method="POST" once honeypot min-time="3s">
        <core-input name="email" type="email" required></core-input>
        <core-input name="password" type="password" required></core-input>
        <core-checkbox name="terms" required>I accept the terms</core-checkbox>
        <button type="submit">Sign up</button>
      </core-form>
    `;
    document.body.appendChild(el);
    await new Promise((r) => requestAnimationFrame(r));
    expect(el.querySelector('core-form')).not.toBeNull();
  });
});
