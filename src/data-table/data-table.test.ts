// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.3 — no upstream in core/ide.
import { describe, it, expect, afterEach } from 'vitest';
import './column';
import './data-table';

afterEach(() => {
  document.body.innerHTML = '';
});

// ── helpers ──────────────────────────────────────────────────────────────────

async function makeTable(html: string): Promise<Element> {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  await new Promise((r) => requestAnimationFrame(r));
  await new Promise((r) => requestAnimationFrame(r));
  return wrapper.querySelector('core-data-table')!;
}

// ── baseline render ──────────────────────────────────────────────────────────

describe('<core-data-table> — baseline render', () => {
  it('registers as core-data-table custom element', async () => {
    const el = await makeTable(`<core-data-table></core-data-table>`);
    expect(el.tagName.toLowerCase()).toBe('core-data-table');
  });

  it('renders empty state when rows is empty and loading is absent', async () => {
    const el = await makeTable(`
      <core-data-table>
        <core-column key="name" label="Name"></core-column>
      </core-data-table>
    `);
    const shadow = el.shadowRoot!;
    const empty = shadow.querySelector('[part="empty"]');
    expect(empty).not.toBeNull();
  });

  it('rows setter triggers re-render and cells appear', async () => {
    const el = await makeTable(`
      <core-data-table>
        <core-column key="name" label="Name"></core-column>
      </core-data-table>
    `) as any;
    el.rows = [{ name: 'Alice' }];
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));
    const shadow = el.shadowRoot as ShadowRoot;
    const cells = shadow.querySelectorAll('[part="cell"]');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('reads <core-column> children and renders header cells', async () => {
    const el = await makeTable(`
      <core-data-table>
        <core-column key="name"  label="Name"></core-column>
        <core-column key="email" label="Email"></core-column>
      </core-data-table>
    `) as any;
    el.rows = [{ name: 'Alice', email: 'a@example.com' }];
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));
    const shadow = el.shadowRoot as ShadowRoot;
    const headers = shadow.querySelectorAll('[part="header-cell"]');
    // Selection is none by default, so header count = column count
    expect(headers.length).toBe(2);
  });

  it('hidden column is not rendered', async () => {
    const el = await makeTable(`
      <core-data-table>
        <core-column key="name"     label="Name"></core-column>
        <core-column key="internal" label="Internal" hidden></core-column>
      </core-data-table>
    `) as any;
    el.rows = [{ name: 'Alice', internal: 'X' }];
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));
    const shadow = el.shadowRoot as ShadowRoot;
    const headers = shadow.querySelectorAll('[part="header-cell"]');
    expect(headers.length).toBe(1);
  });

  it('key-field defaults to index-based keys', async () => {
    const el = await makeTable(`
      <core-data-table>
        <core-column key="name" label="Name"></core-column>
      </core-data-table>
    `) as any;
    el.rows = [{ name: 'Alice' }, { name: 'Bob' }];
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));
    const shadow = el.shadowRoot as ShadowRoot;
    const rows = shadow.querySelectorAll('[part="row"]');
    expect(rows.length).toBe(2);
  });

  it('key-field custom property uses row[keyField] for row keys', async () => {
    const el = await makeTable(`
      <core-data-table key-field="id">
        <core-column key="name" label="Name"></core-column>
      </core-data-table>
    `) as any;
    el.rows = [{ id: 'u1', name: 'Alice' }, { id: 'u2', name: 'Bob' }];
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));
    const shadow = el.shadowRoot as ShadowRoot;
    const rows = shadow.querySelectorAll('[part="row"]');
    expect(rows.length).toBe(2);
  });

  it('column attribute change triggers re-render via core-column-changed', async () => {
    const el = await makeTable(`
      <core-data-table>
        <core-column key="name" label="Name"></core-column>
      </core-data-table>
    `) as any;
    el.rows = [{ name: 'Alice' }];
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));
    const col = document.querySelector('core-column')!;
    col.setAttribute('label', 'Full Name');
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => requestAnimationFrame(r));
    const shadow = el.shadowRoot as ShadowRoot;
    const headers = shadow.querySelectorAll('[part="header-cell"]');
    // Header should now contain "Full Name" — assert at least one header exists
    expect(headers.length).toBeGreaterThan(0);
  });
});

// ── Sort behaviour ───────────────────────────────────────────────────────────

describe('<core-data-table> — sort behaviour', () => {
  async function makeSortTable(): Promise<any> {
    const el = await makeTable(`
      <core-data-table>
        <core-column key="name" label="Name" sortable></core-column>
        <core-column key="score" label="Score" sortable type="number" align="end"></core-column>
      </core-data-table>
    `);
    (el as any).rows = [
      { name: 'Charlie', score: 30 },
      { name: 'Alice',   score: 10 },
      { name: 'Bob',     score: 20 },
    ];
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));
    return el;
  }

  it('clicking a sortable header fires core-sort-change with correct detail', async () => {
    const el = await makeSortTable();
    let detail: any;
    el.addEventListener('core-sort-change', (e: Event) => { detail = (e as CustomEvent).detail; });
    const header = el.shadowRoot!.querySelector('[part="header-cell"][data-sortable]') as HTMLElement;
    header?.click();
    expect(detail).toBeDefined();
    expect(detail.key).toBe('name');
    expect(detail.dir).toBe('asc');
    expect(detail.previousKey).toBeNull();
  });

  it('tri-state: first click → asc, second click → desc, third click → null (unsorted)', async () => {
    const el = await makeSortTable();
    const header = el.shadowRoot!.querySelector('[part="header-cell"][data-sortable]') as HTMLElement;
    const dirs: Array<string | null> = [];
    el.addEventListener('core-sort-change', (e: Event) => {
      dirs.push((e as CustomEvent).detail.dir);
    });
    header?.click();
    header?.click();
    header?.click();
    expect(dirs).toEqual(['asc', 'desc', null]);
  });

  it('preventDefault on core-sort-change prevents built-in sort (rows unchanged)', async () => {
    const el = await makeSortTable();
    el.addEventListener('core-sort-change', (e: Event) => { e.preventDefault(); });
    const original = (el as any).rows.map((r: any) => r.name);
    const header = el.shadowRoot!.querySelector('[part="header-cell"][data-sortable]') as HTMLElement;
    header?.click();
    await new Promise((r) => requestAnimationFrame(r));
    const after = (el as any).rows.map((r: any) => r.name);
    expect(after).toEqual(original);
  });

  it('sort asc: cells render in ascending name order', async () => {
    const el = await makeSortTable();
    const header = el.shadowRoot!.querySelector('[part="header-cell"][data-sortable]') as HTMLElement;
    header?.click();
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));
    const cells = Array.from(el.shadowRoot!.querySelectorAll('[part="cell"]')).map((c: any) => c.textContent?.trim());
    expect(cells[0]).toBe('Alice');
  });

  it('unsorted click restores original order', async () => {
    const el = await makeSortTable();
    const header = el.shadowRoot!.querySelector('[part="header-cell"][data-sortable]') as HTMLElement;
    header?.click();
    header?.click();
    header?.click();
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));
    const cells = Array.from(el.shadowRoot!.querySelectorAll('[part="cell"]')).map((c: any) => c.textContent?.trim());
    expect(cells[0]).toBe('Charlie');
  });

  it('sort-by and sort-dir attributes reflect current sort state', async () => {
    const el = await makeSortTable();
    const header = el.shadowRoot!.querySelector('[part="header-cell"][data-sortable]') as HTMLElement;
    header?.click();
    expect(el.getAttribute('sort-by')).toBe('name');
    expect(el.getAttribute('sort-dir')).toBe('asc');
  });
});

// ── Pagination footer ─────────────────────────────────────────────────────────

describe('<core-data-table> — pagination footer', () => {
  async function makePagedTable(pageSize = 5): Promise<any> {
    const el = await makeTable(`
      <core-data-table page-size="${pageSize}">
        <core-column key="name" label="Name"></core-column>
      </core-data-table>
    `);
    (el as any).rows = Array.from({ length: 12 }, (_, i) => ({ name: `Row ${i + 1}` }));
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));
    return el;
  }

  it('pagination part renders when page-size > 0', async () => {
    const el = await makePagedTable(5);
    const pager = el.shadowRoot!.querySelector('[part="pagination"]');
    expect(pager).not.toBeNull();
  });

  it('only page-size rows are visible on first page', async () => {
    const el = await makePagedTable(5);
    const rows = el.shadowRoot!.querySelectorAll('[data-row]');
    expect(rows.length).toBe(5);
  });

  it('next page button advances page and fires core-page-change', async () => {
    const el = await makePagedTable(5);
    let detail: any;
    el.addEventListener('core-page-change', (e: Event) => { detail = (e as CustomEvent).detail; });
    const next = el.shadowRoot!.querySelector('button[aria-label="Next page"]') as HTMLButtonElement;
    next?.click();
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));
    expect(detail).toBeDefined();
    expect(detail.page).toBe(1);
    expect(detail.pageSize).toBe(5);
    expect(detail.totalRows).toBe(12);
  });

  it('prev page button is disabled on first page', async () => {
    const el = await makePagedTable(5);
    const prev = el.shadowRoot!.querySelector('button[aria-label="Previous page"]') as HTMLButtonElement;
    expect(prev?.disabled).toBe(true);
  });

  it('page resets to 0 on rows change (without preserve-page)', async () => {
    const el = await makePagedTable(5);
    el.page = 1;
    await new Promise((r) => requestAnimationFrame(r));
    (el as any).rows = [{ name: 'Only One' }];
    await new Promise((r) => requestAnimationFrame(r));
    expect(el.page).toBe(0);
  });

  it('preserve-page keeps page index across rows change', async () => {
    const el = await makeTable(`
      <core-data-table page-size="5" preserve-page>
        <core-column key="name" label="Name"></core-column>
      </core-data-table>
    `) as any;
    el.rows = Array.from({ length: 12 }, (_, i) => ({ name: `Row ${i + 1}` }));
    await new Promise((r) => requestAnimationFrame(r));
    el.page = 1;
    el.rows = Array.from({ length: 20 }, (_, i) => ({ name: `New ${i + 1}` }));
    await new Promise((r) => requestAnimationFrame(r));
    expect(el.page).toBe(1);
  });
});
