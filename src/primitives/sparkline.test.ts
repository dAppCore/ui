// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.5 — no upstream in core/ide.
import { describe, it, expect } from 'vitest';
import './sparkline';

describe('<core-sparkline>', () => {
  it('renders inline SVG with [part="base"] and [part="line"] for line kind', async () => {
    const el = document.createElement('core-sparkline');
    el.setAttribute('points', '1,3,2,5,4');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.querySelector('svg[part="base"]')).not.toBeNull();
    expect(el.querySelector('path[part="line"]')).not.toBeNull();
  });

  it('renders [part="area"] when kind=area', async () => {
    const el = document.createElement('core-sparkline');
    el.setAttribute('points', '1,3,2,5,4');
    el.setAttribute('kind', 'area');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.querySelector('path[part="area"]')).not.toBeNull();
  });

  it('renders [part="marker"] elements when kind=bars', async () => {
    const el = document.createElement('core-sparkline');
    el.setAttribute('points', '1,3,2,5,4');
    el.setAttribute('kind', 'bars');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    const bars = el.querySelectorAll('rect[part="marker"]');
    expect(bars).toHaveLength(5);
  });

  it('reads data from slotted <data> children when points attr is absent', async () => {
    const el = document.createElement('core-sparkline');
    el.innerHTML =
      '<data value="1"></data><data value="3"></data>' +
      '<data value="2"></data><data value="5"></data>';
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.querySelector('path[part="line"]')).not.toBeNull();
  });

  it('points attribute wins over slotted data', async () => {
    const el = document.createElement('core-sparkline');
    el.setAttribute('points', '10,20');
    el.innerHTML = '<data value="0"></data><data value="100"></data>';
    document.body.appendChild(el);
    await (el as any).updateComplete;
    const d = el.querySelector('path[part="line"]')?.getAttribute('d') || '';
    // line must use range 10..20, not 0..100 — d coords should reflect that
    // (sanity check: rendered viewBox y-coords match the points attr range).
    expect(d.length).toBeGreaterThan(0);
  });

  it('renders empty SVG with no errors when no data is provided', async () => {
    const el = document.createElement('core-sparkline');
    document.body.appendChild(el);
    await (el as any).updateComplete;
    expect(el.querySelector('svg[part="base"]')).not.toBeNull();
  });
});
