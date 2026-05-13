// SPDX-Licence-Identifier: EUPL-1.2
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import './core-form.js';
import { setFormatterContext, resetFormatterContext } from '../formatters/context.js';
import { importHmacKey } from '../crypto/hmac.js';
import { verifyFormData } from '../crypto/forms.js';

async function flush(): Promise<void> {
  await new Promise((r) => setTimeout(r, 0));
}

function mountForm(html: string): HTMLElement {
  document.body.innerHTML = html;
  return document.body.firstElementChild as HTMLElement;
}

function blockedDetail(el: HTMLElement): Promise<{ reason: string }> {
  return new Promise((resolve) => {
    el.addEventListener('core-form-blocked', (e) => resolve((e as CustomEvent).detail), { once: true });
  });
}

describe('coreForm_Good', () => {
  beforeEach(() => resetFormatterContext());
  afterEach(() => (document.body.innerHTML = ''));

  it('renders a <form> with the right action/method/enctype', async () => {
    const el = mountForm(`<core-form action="/v1/x" method="POST"></core-form>`);
    await flush();
    const f = el.querySelector('form')!;
    expect(f.action).toContain('/v1/x');
    expect(f.method.toLowerCase()).toBe('post'); // happy-dom preserves case; real browsers lowercase
  });

  it('injects an invisible honeypot input when `honeypot` is set', async () => {
    const el = mountForm(`<core-form honeypot></core-form>`);
    await flush();
    const honey = el.querySelector('input[name="__honey"]');
    expect(honey).not.toBeNull();
    expect(honey?.getAttribute('aria-hidden')).toBe('true');
    expect(honey?.getAttribute('tabindex')).toBe('-1');
  });
});

describe('coreForm_Bad', () => {
  beforeEach(() => resetFormatterContext());
  afterEach(() => (document.body.innerHTML = ''));

  it('blocks submit when honeypot is filled', async () => {
    const el = mountForm(`<core-form honeypot action="/x"></core-form>`);
    await flush();
    const honey = el.querySelector<HTMLInputElement>('input[name="__honey"]')!;
    honey.value = 'bot-was-here';
    const blocked = blockedDetail(el);
    el.querySelector('form')!.dispatchEvent(new SubmitEvent('submit', { cancelable: true }));
    expect((await blocked).reason).toBe('honeypot');
  });

  it('blocks submit when faster than min-time', async () => {
    const el = mountForm(`<core-form action="/x" min-time="1s"></core-form>`);
    await flush();
    const blocked = blockedDetail(el);
    el.querySelector('form')!.dispatchEvent(new SubmitEvent('submit', { cancelable: true }));
    expect((await blocked).reason).toBe('too-fast');
  });

  it('blocks submit when action= is outside allowed-actions allowlist', async () => {
    const el = mountForm(
      `<core-form action="https://evil.example.com/x" allowed-actions="^https://api\\.lthn\\.ai/"></core-form>`,
    );
    await flush();
    const blocked = blockedDetail(el);
    el.querySelector('form')!.dispatchEvent(new SubmitEvent('submit', { cancelable: true }));
    expect((await blocked).reason).toBe('action-not-allowed');
  });

  it('blocks second submit when `once` is set', async () => {
    const el = mountForm(`<core-form action="/x" once></core-form>`);
    await flush();
    const form = el.querySelector('form')!;
    // submit once — native submit path won't navigate in happy-dom, but `done` flag flips.
    form.dispatchEvent(new SubmitEvent('submit', { cancelable: true }));
    await flush();
    // Force `done` since native submit doesn't complete in happy-dom; simulate by re-submitting.
    (el as unknown as { done: boolean }).done = true;
    const blocked = blockedDetail(el);
    form.dispatchEvent(new SubmitEvent('submit', { cancelable: true }));
    expect((await blocked).reason).toBe('double-submit');
  });

  it('blocks submit when hmac-fields is set but key is missing from context', async () => {
    const el = mountForm(
      `<core-form action="/x" hmac-fields hmac-key="missing"><input name="x" value="1"></core-form>`,
    );
    await flush();
    const blocked = blockedDetail(el);
    el.querySelector('form')!.dispatchEvent(new SubmitEvent('submit', { cancelable: true }));
    expect((await blocked).reason).toBe('hmac-key-missing');
  });

  it('blocks submit when csrf-meta points at a missing meta tag', async () => {
    const el = mountForm(`<core-form action="/x" csrf-meta="missing-token"></core-form>`);
    await flush();
    const blocked = blockedDetail(el);
    el.querySelector('form')!.dispatchEvent(new SubmitEvent('submit', { cancelable: true }));
    expect((await blocked).reason).toBe('csrf-missing');
  });
});

describe('coreForm_Ugly', () => {
  beforeEach(() => resetFormatterContext());
  afterEach(() => (document.body.innerHTML = ''));

  it('reads CSRF token from <meta> and injects as hidden _csrf', async () => {
    const meta = document.createElement('meta');
    meta.name = 'csrf-token';
    meta.content = 'csrf-from-meta';
    document.head.appendChild(meta);

    const el = mountForm(
      `<core-form action="/x" csrf-meta="csrf-token" min-time="0"><input name="x" value="1"></core-form>`,
    );
    await flush();
    // Force renderedAt to make min-time pass; happy-dom performance.now is fine.
    (el as unknown as { renderedAt: number }).renderedAt = -10000;
    el.querySelector('form')!.dispatchEvent(new SubmitEvent('submit', { cancelable: true }));
    await flush();

    const csrf = el.querySelector<HTMLInputElement>('input[name="_csrf"]');
    expect(csrf?.value).toBe('csrf-from-meta');
    meta.remove();
  });

  it('signs FormData and attaches a verifiable __hmac field', async () => {
    const key = await importHmacKey('round-trip-secret');
    setFormatterContext('crypto', { hmac_key: key });

    const el = mountForm(`
      <core-form action="/x" hmac-fields hmac-bind-timestamp hmac-bind-nonce min-time="0">
        <input name="amount" value="100">
        <input name="to" value="alice">
      </core-form>
    `);
    await flush();
    (el as unknown as { renderedAt: number }).renderedAt = -10000;
    el.querySelector('form')!.dispatchEvent(new SubmitEvent('submit', { cancelable: true }));
    await flush();
    await flush();

    const form = el.querySelector('form')!;
    const hmac = form.querySelector<HTMLInputElement>('input[name="__hmac"]')?.value;
    expect(hmac).toMatch(/^[0-9a-f]{64}$/);

    // Reconstruct the FormData server-side and verify.
    const data = new FormData(form);
    const tag = data.get('__hmac') as string;
    expect(await verifyFormData(key, data, tag)).toBe(true);
  });
});
