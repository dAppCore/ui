// SPDX-Licence-Identifier: EUPL-1.2
// AX rule: each test is a copy-pastable usage example for the component.
import { describe, it, expect } from 'vitest';
import '.';

describe('@dappcore/ui/data-table — v0.3 usage examples', () => {
  it('example: minimal bare table (no sort, no pagination)', async () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <core-data-table>
        <core-column key="name"  label="Name"></core-column>
        <core-column key="email" label="Email"></core-column>
      </core-data-table>
    `;
    document.body.appendChild(wrapper);
    await new Promise((r) => requestAnimationFrame(r));
    const el = wrapper.querySelector('core-data-table') as any;
    el.rows = [
      { name: 'Alice', email: 'alice@example.com' },
      { name: 'Bob',   email: 'bob@example.com' },
    ];
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));
    expect(el).not.toBeNull();
    expect(el.rows.length).toBe(2);
    wrapper.remove();
  });

  it('example: full-featured (sort + multi-select + pagination + density)', async () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <core-data-table
        selection="multi"
        page-size="5"
        density="cozy"
        sticky-header
        key-field="id"
      >
        <core-column key="name"    label="Name"    sortable></core-column>
        <core-column key="score"   label="Score"   sortable type="number" align="end"></core-column>
        <core-column key="joined"  label="Joined"  sortable type="date"></core-column>
        <core-column key="active"  label="Active"  type="boolean"></core-column>
      </core-data-table>
    `;
    document.body.appendChild(wrapper);
    await new Promise((r) => requestAnimationFrame(r));
    const el = wrapper.querySelector('core-data-table') as any;
    el.rows = Array.from({ length: 20 }, (_, i) => ({
      id: `u${i}`,
      name: `User ${i}`,
      score: i * 10,
      joined: `2024-0${(i % 9) + 1}-01`,
      active: i % 2 === 0,
    }));
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));
    expect(el).not.toBeNull();
    expect(el.selection).toBe('multi');
    // T7 used [data-row] selector to work around happy-dom CSS quirk
    const rows = el.shadowRoot!.querySelectorAll('[data-row]');
    expect(rows.length).toBe(5);
    wrapper.remove();
  });

  it('example: server-driven sort via preventDefault on core-sort-change', async () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <core-data-table>
        <core-column key="name" label="Name" sortable></core-column>
      </core-data-table>
    `;
    document.body.appendChild(wrapper);
    await new Promise((r) => requestAnimationFrame(r));
    const el = wrapper.querySelector('core-data-table') as any;
    const initialRows = [{ name: 'Charlie' }, { name: 'Alice' }];
    el.rows = [...initialRows];
    await new Promise((r) => requestAnimationFrame(r));

    let sortEventDetail: any = null;
    el.addEventListener('core-sort-change', (e: Event) => {
      e.preventDefault();
      sortEventDetail = (e as CustomEvent).detail;
      el.rows = [{ name: 'Alice' }, { name: 'Charlie' }];
    });

    const headerCell = el.shadowRoot!.querySelector('[part="header-cell"][data-sortable]') as HTMLElement;
    headerCell?.click();
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));

    expect(sortEventDetail).not.toBeNull();
    expect(sortEventDetail.key).toBe('name');
    expect(el.rows[0].name).toBe('Alice');
    wrapper.remove();
  });

  it('example: custom cellRender via column.cellRender returning string content', async () => {
    // NOTE: spec §4.2 calls this "render" but implementation uses cellRender
    // to avoid colliding with LitElement.render(). Documented in T4 commit.
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <core-data-table key-field="id">
        <core-column key="name"    label="Name"></core-column>
        <core-column key="actions" label=""></core-column>
      </core-data-table>
    `;
    document.body.appendChild(wrapper);
    await new Promise((r) => requestAnimationFrame(r));
    const el = wrapper.querySelector('core-data-table') as any;
    const actionsCol = wrapper.querySelector('core-column[key="actions"]') as any;
    actionsCol.cellRender = (row: any) => `Edit ${row.name}`;

    el.rows = [{ id: 'u1', name: 'Alice' }];
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));

    const cells = Array.from(el.shadowRoot!.querySelectorAll('[part="cell"]')) as HTMLElement[];
    const actionsCell = cells.find((c) => c.textContent?.includes('Edit Alice'));
    expect(actionsCell).not.toBeUndefined();
    wrapper.remove();
  });
});
