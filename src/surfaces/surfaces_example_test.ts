// SPDX-Licence-Identifier: EUPL-1.2
// AX rule: each test is a copy-pastable usage example for the component.
import { describe, it, expect } from 'vitest';
import '.';

describe('@dappcore/ui/surfaces — v0.8 usage examples', () => {
  it('example: <core-dialog> with header, body, footer slots', async () => {
    const el = document.createElement('div');
    el.innerHTML = `
      <core-dialog modal size="md" closedby="closerequest">
        <h2 slot="header">Confirm deletion</h2>
        <p>This action cannot be undone.</p>
        <div slot="footer">
          <button data-core-close>Cancel</button>
          <button onclick="this.closest('core-dialog').close('confirm')">Delete</button>
        </div>
      </core-dialog>
    `;
    document.body.appendChild(el);
    await new Promise((r) => requestAnimationFrame(r));
    expect(el.querySelector('core-dialog')).not.toBeNull();
    el.remove();
  });

  it('example: <core-drawer> end-side panel with header and footer', async () => {
    const el = document.createElement('div');
    el.innerHTML = `
      <core-drawer modal side="end" closedby="any">
        <h2 slot="header">Cart (3 items)</h2>
        <p>Item one, item two, item three.</p>
        <div slot="footer"><button>Checkout</button></div>
      </core-drawer>
    `;
    document.body.appendChild(el);
    await new Promise((r) => requestAnimationFrame(r));
    expect(el.querySelector('core-drawer')).not.toBeNull();
    el.remove();
  });

  it('example: <core-popover> anchored to a button', async () => {
    const el = document.createElement('div');
    el.innerHTML = `
      <button id="ex-more-btn">More</button>
      <core-popover anchor="#ex-more-btn" placement="bottom-start" offset="8">
        <ul>
          <li><button>Edit</button></li>
          <li><button>Delete</button></li>
        </ul>
      </core-popover>
    `;
    document.body.appendChild(el);
    await new Promise((r) => requestAnimationFrame(r));
    expect(el.querySelector('core-popover')).not.toBeNull();
    el.remove();
  });

  it('example: <core-tooltip> wired to an icon button', async () => {
    const el = document.createElement('div');
    el.innerHTML = `
      <button id="ex-save-btn" aria-label="Save">💾</button>
      <core-tooltip anchor="#ex-save-btn" placement="top" delay-in="700">
        Save (⌘S)
      </core-tooltip>
    `;
    document.body.appendChild(el);
    await new Promise((r) => requestAnimationFrame(r));
    const tooltip = el.querySelector('core-tooltip');
    expect(tooltip).not.toBeNull();
    const anchorEl = el.querySelector('#ex-save-btn');
    const describedby = anchorEl?.getAttribute('aria-describedby') ?? '';
    expect(describedby).toContain(tooltip!.id);
    el.remove();
  });
});
