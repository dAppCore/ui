// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.5 — no upstream in core/ide.
import { describe, it, expect } from 'vitest';
import { html } from 'lit';
import { CoreElement } from './light-dom';

class TestComponent extends CoreElement {
  render() { return html`<div>hello</div>`; }
}
customElements.define('test-core-element', TestComponent);

describe('CoreElement', () => {
  it('renders into light DOM (no shadow root)', async () => {
    const el = document.createElement('test-core-element') as TestComponent;
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot).toBeNull();
    expect(el.querySelector('div')?.textContent).toBe('hello');
  });

  it('allows skin layers to target light-DOM children directly', async () => {
    const el = document.createElement('test-core-element') as TestComponent;
    document.body.appendChild(el);
    await el.updateComplete;
    const child = el.querySelector('div');
    expect(child).toBeInstanceOf(HTMLElement);
    expect(child?.parentElement).toBe(el);
  });
});
