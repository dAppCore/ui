// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.6 — minimal router; no upstream in core/ide.
import { describe, it, expect } from 'vitest';
import './router';
import './route';

describe('<core-route>', () => {
  it('renders its slot when the path matches the current router state', async () => {
    window.location.hash = '#/about';
    document.body.innerHTML = `
      <core-router>
        <core-route path="/about"><span class="probe">About page</span></core-route>
      </core-router>
    `;
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));
    const route = document.querySelector('core-route') as HTMLElement;
    expect(route.hasAttribute('hidden')).toBe(false);
    expect(route.querySelector('.probe')?.textContent).toBe('About page');
  });

  it('hides its slot (hidden attribute) when the path does not match', async () => {
    window.location.hash = '#/other';
    document.body.innerHTML = `
      <core-router>
        <core-route path="/about"><span>About</span></core-route>
      </core-router>
    `;
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));
    const route = document.querySelector('core-route') as HTMLElement;
    expect(route.hasAttribute('hidden')).toBe(true);
  });

  it('exposes parsed :param values via data-params attribute', async () => {
    window.location.hash = '#/users/42';
    document.body.innerHTML = `
      <core-router>
        <core-route path="/users/:id"><user-detail></user-detail></core-route>
      </core-router>
    `;
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));
    const route = document.querySelector('core-route') as HTMLElement;
    expect(route.hasAttribute('hidden')).toBe(false);
    const params = JSON.parse(route.getAttribute('data-params') ?? '{}');
    expect(params).toEqual({ id: '42' });
  });
});
