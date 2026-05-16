// SPDX-Licence-Identifier: EUPL-1.2
// Integration test: <core-button type="submit"> submits the parent <form>.
import { describe, it, expect, vi } from 'vitest';
import '../../../src/primitives';

describe('integration: <core-button> form submit', () => {
  it('submits the parent form on click when type=submit', async () => {
    const form = document.createElement('form');
    form.action = '/test';
    form.method = 'POST';
    form.innerHTML = `
      <input name="email" value="test@example.com">
      <core-button type="submit">Save</core-button>
    `;
    document.body.appendChild(form);
    await new Promise((r) => requestAnimationFrame(r));

    const handler = vi.fn((e: SubmitEvent) => e.preventDefault());
    form.addEventListener('submit', handler);

    (form.querySelector('core-button') as HTMLElement).click();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not submit when disabled', async () => {
    const form = document.createElement('form');
    form.innerHTML = `<core-button type="submit" disabled>Save</core-button>`;
    document.body.appendChild(form);
    await new Promise((r) => requestAnimationFrame(r));

    const handler = vi.fn();
    form.addEventListener('submit', handler);
    (form.querySelector('core-button') as HTMLElement).click();
    expect(handler).not.toHaveBeenCalled();
  });

  it('resets the form when type=reset', async () => {
    const form = document.createElement('form');
    form.innerHTML = `
      <input name="email" value="initial">
      <core-button type="reset">Reset</core-button>
    `;
    document.body.appendChild(form);
    await new Promise((r) => requestAnimationFrame(r));

    const input = form.querySelector('input') as HTMLInputElement;
    input.value = 'edited';

    (form.querySelector('core-button') as HTMLElement).click();
    expect(input.value).toBe('initial');
  });
});
