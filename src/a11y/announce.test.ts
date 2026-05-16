// SPDX-Licence-Identifier: EUPL-1.2
import { describe, it, expect, beforeEach } from 'vitest';
import { announce } from './announce';

describe('announce', () => {
  beforeEach(() => { document.body.innerHTML = ''; });
  it('creates the singleton live region on first call', async () => {
    announce('Hello');
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    const polite = document.querySelector('[aria-live="polite"]');
    expect(polite?.textContent).toBe('Hello');
  });
  it('writes to the assertive region when requested', async () => {
    announce('Critical', 'assertive');
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    const assertive = document.querySelector('[aria-live="assertive"]');
    expect(assertive?.textContent).toBe('Critical');
  });
});
