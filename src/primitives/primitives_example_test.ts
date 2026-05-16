// SPDX-Licence-Identifier: EUPL-1.2
// AX rule: each test is a copy-pastable usage example for the primitive.
import { describe, it, expect } from 'vitest';
import '.';

describe('@dappcore/ui/primitives — usage examples', () => {
  it('example: <core-button> primary inside a form', async () => {
    const form = document.createElement('form');
    form.innerHTML = `
      <core-button variant="primary" type="submit">Save</core-button>
    `;
    document.body.appendChild(form);
    await new Promise((r) => requestAnimationFrame(r));
    expect(form.querySelector('core-button')).not.toBeNull();
  });

  it('example: <core-toggle> with form name + value', async () => {
    const form = document.createElement('form');
    form.innerHTML = `<core-toggle name="notify" value="yes" checked>Notify me</core-toggle>`;
    document.body.appendChild(form);
    await new Promise((r) => requestAnimationFrame(r));
    expect(form.querySelector('core-toggle')).not.toBeNull();
  });

  it('example: <core-status-dot> with pulse', async () => {
    const el = document.createElement('div');
    el.innerHTML = `<core-status-dot state="good" pulse aria-label="Online"></core-status-dot>`;
    document.body.appendChild(el);
    await new Promise((r) => requestAnimationFrame(r));
    expect(el.querySelector('core-status-dot')).not.toBeNull();
  });

  it('example: <core-pill> brand state with icon', async () => {
    const el = document.createElement('div');
    el.innerHTML = `
      <core-pill state="brand">
        <core-icon slot="leading" name="check" decorative></core-icon>
        Active
      </core-pill>
    `;
    document.body.appendChild(el);
    await new Promise((r) => requestAnimationFrame(r));
    expect(el.querySelector('core-pill')).not.toBeNull();
  });

  it('example: <core-icon> via registered name + custom via slot', async () => {
    const el = document.createElement('div');
    el.innerHTML = `
      <core-icon name="search" size="lg"></core-icon>
      <core-icon><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg></core-icon>
    `;
    document.body.appendChild(el);
    await new Promise((r) => requestAnimationFrame(r));
    expect(el.querySelectorAll('core-icon')).toHaveLength(2);
  });

  it('example: <core-card> interactive with header + footer', async () => {
    const el = document.createElement('div');
    el.innerHTML = `
      <core-card elevation="raised" interactive>
        <h3 slot="header">Plan</h3>
        Pro tier — £18.40 / month
        <div slot="footer"><core-button variant="primary">Choose</core-button></div>
      </core-card>
    `;
    document.body.appendChild(el);
    await new Promise((r) => requestAnimationFrame(r));
    expect(el.querySelector('core-card')).not.toBeNull();
  });

  it('example: <core-label> with required field association', async () => {
    const el = document.createElement('div');
    el.innerHTML = `
      <core-label for="email" required>Email</core-label>
      <input id="email" type="email">
    `;
    document.body.appendChild(el);
    await new Promise((r) => requestAnimationFrame(r));
    expect(el.querySelector('core-label')).not.toBeNull();
  });

  it('example: <core-glass> dark variant wrapping content', async () => {
    const el = document.createElement('div');
    el.innerHTML = `<core-glass dark radius="20px"><p>Floating panel</p></core-glass>`;
    document.body.appendChild(el);
    await new Promise((r) => requestAnimationFrame(r));
    expect(el.querySelector('core-glass')).not.toBeNull();
  });

  it('example: <core-window-controls> auto-detect platform', async () => {
    const el = document.createElement('div');
    el.innerHTML = `<core-window-controls platform="macos"></core-window-controls>`;
    document.body.appendChild(el);
    await new Promise((r) => requestAnimationFrame(r));
    expect(el.querySelector('core-window-controls')).not.toBeNull();
  });

  it('example: <core-rail> sidebar item with badge', async () => {
    const el = document.createElement('div');
    el.innerHTML = `
      <core-rail to="/inbox" active>
        <core-icon slot="leading" name="search" decorative></core-icon>
        Inbox
        <core-pill slot="trailing" size="sm" state="brand">3</core-pill>
      </core-rail>
    `;
    document.body.appendChild(el);
    await new Promise((r) => requestAnimationFrame(r));
    expect(el.querySelector('core-rail')).not.toBeNull();
  });

  it('example: <core-sparkline> area kind from points attribute', async () => {
    const el = document.createElement('div');
    el.innerHTML = `<core-sparkline kind="area" points="2,4,3,6,5,8,7"></core-sparkline>`;
    document.body.appendChild(el);
    await new Promise((r) => requestAnimationFrame(r));
    expect(el.querySelector('core-sparkline')).not.toBeNull();
  });
});
