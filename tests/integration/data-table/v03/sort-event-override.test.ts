// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.3 — no upstream in core/ide.
// Integration test: server-driven sort via core-sort-change preventDefault.
import { describe, it, expect, afterEach } from 'vitest';
import '../../../../src/data-table/index';

afterEach(() => { document.body.innerHTML = ''; });

async function makeEl(): Promise<any> {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <core-data-table key-field="id">
      <core-column key="name" label="Name" sortable></core-column>
    </core-data-table>
  `;
  document.body.appendChild(wrapper);
  await new Promise((r) => requestAnimationFrame(r));
  const el = wrapper.querySelector('core-data-table') as any;
  el.rows = [{ id: '1', name: 'Charlie' }, { id: '2', name: 'Alice' }, { id: '3', name: 'Bob' }];
  await new Promise((r) => requestAnimationFrame(r));
  await new Promise((r) => requestAnimationFrame(r));
  return el;
}

describe('sort-event-override integration', () => {
  it('preventDefault stops internal sort; original row reference unchanged', async () => {
    const el = await makeEl();
    el.addEventListener('core-sort-change', (e: Event) => { e.preventDefault(); });
    const header = el.shadowRoot!.querySelector('[part="header-cell"][data-sortable]') as HTMLElement;
    header?.click();
    await new Promise((r) => requestAnimationFrame(r));
    // Internal rows not mutated — same order as original
    expect(el.rows[0].name).toBe('Charlie');
  });

  it('sort-by attr reflects the requested key even when preventDefault called', async () => {
    const el = await makeEl();
    el.addEventListener('core-sort-change', (e: Event) => { e.preventDefault(); });
    const header = el.shadowRoot!.querySelector('[part="header-cell"][data-sortable]') as HTMLElement;
    header?.click();
    expect(el.getAttribute('sort-by')).toBe('name');
  });

  it('sort-dir attr reflects "asc" even when preventDefault called', async () => {
    const el = await makeEl();
    el.addEventListener('core-sort-change', (e: Event) => { e.preventDefault(); });
    const header = el.shadowRoot!.querySelector('[part="header-cell"][data-sortable]') as HTMLElement;
    header?.click();
    expect(el.getAttribute('sort-dir')).toBe('asc');
  });

  it('consumer can assign sorted rows after preventDefault', async () => {
    const el = await makeEl();
    el.addEventListener('core-sort-change', (e: Event) => {
      e.preventDefault();
      // Server response — pre-sorted
      el.rows = [{ id: '2', name: 'Alice' }, { id: '3', name: 'Bob' }, { id: '1', name: 'Charlie' }];
    });
    const header = el.shadowRoot!.querySelector('[part="header-cell"][data-sortable]') as HTMLElement;
    header?.click();
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));
    expect(el.rows[0].name).toBe('Alice');
  });

  it('second click (desc cycle) reflects sort-dir="desc" on attr', async () => {
    const el = await makeEl();
    const header = el.shadowRoot!.querySelector('[part="header-cell"][data-sortable]') as HTMLElement;
    header?.click(); // asc
    header?.click(); // desc
    expect(el.getAttribute('sort-dir')).toBe('desc');
  });

  it('third click (unsorted cycle) sets sort-by to null on attr', async () => {
    const el = await makeEl();
    const header = el.shadowRoot!.querySelector('[part="header-cell"][data-sortable]') as HTMLElement;
    header?.click(); // asc
    header?.click(); // desc
    header?.click(); // unsorted
    expect(el.getAttribute('sort-by')).toBeNull();
  });
});
