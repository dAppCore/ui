// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.3 — no upstream in core/ide.
import { LitElement, html, css, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { TemplateResult } from 'lit';
import type { CoreColumn } from './column';
import { sortRows } from './_shared/sort';
import { pageCount, pageSlice, pageWindow } from './_shared/pagination';
import type { SortDir, ColumnType } from './_shared/sort';

export type SelectionMode = 'none' | 'single' | 'multi';
export type DensityMode = 'comfortable' | 'cozy' | 'compact';

// Row type — open record
export type Row = Record<string, unknown>;

// Unique ID counter for radio group names and aria
let _uid = 0;

/** Type-aware default cell value formatter. */
function defaultFormat(value: unknown, type: ColumnType): string {
  if (value === null || value === undefined) return '';
  switch (type) {
    case 'number':  return Number(value).toLocaleString();
    case 'date':    return new Date(value as string | number | Date).toLocaleDateString();
    case 'boolean': return value ? '✓' : '—';
    default:        return String(value);
  }
}

/**
 * `<core-data-table>` — Shadow DOM data-presentation component.
 *
 * Renders rows from the `rows` property using `<core-column>` child elements
 * as column definitions. Supports built-in sort, pagination, row selection,
 * density modes, sticky header, loading + empty states, and keyboard nav.
 *
 * Usage:
 *   <core-data-table .rows=${items} selection="multi" page-size="10" density="cozy">
 *     <core-column key="name"  label="Name"    sortable></core-column>
 *     <core-column key="score" label="Score"   sortable type="number" align="end"></core-column>
 *   </core-data-table>
 *
 * Attributes (reflected): selection, page-size, density, sticky-header, loading,
 *   sort-by, sort-dir, key-field, preserve-selection, preserve-page, no-row-click-select
 * Properties (not reflected): rows, selected, page
 * Methods: refresh(), clearSelection(), selectAll(), selectNone(), sortBy()
 * Events: core-sort-change (cancellable), core-page-change, core-selection-change, core-row-click
 * Slots: default (core-column children), header, footer, pagination, loading, empty
 * Parts: table, header, header-row, header-cell, body, row, row-selected, cell, pagination, loading, empty
 */
@customElement('core-data-table')
export class CoreDataTable extends LitElement {
  private _uid = ++_uid;

  // ── Reflected attributes ─────────────────────────────────────────────────

  @property({ reflect: true }) selection: SelectionMode = 'none';
  @property({ reflect: true, attribute: 'page-size', type: Number }) pageSize = 0;
  @property({ reflect: true }) density: DensityMode = 'cozy';
  @property({ reflect: true, type: Boolean, attribute: 'sticky-header' }) stickyHeader = true;
  @property({ reflect: true, type: Boolean }) loading = false;
  @property({ reflect: true, attribute: 'sort-by' }) sortByAttr: string | null = null;
  @property({ reflect: true, attribute: 'sort-dir' }) sortDirAttr: SortDir = 'asc';
  @property({ reflect: true, attribute: 'key-field' }) keyField = '';
  @property({ reflect: true, type: Boolean, attribute: 'preserve-selection' }) preserveSelection = false;
  @property({ reflect: true, type: Boolean, attribute: 'preserve-page' }) preservePage = false;
  @property({ reflect: true, type: Boolean, attribute: 'no-row-click-select' }) noRowClickSelect = false;

  // ── Internal state ───────────────────────────────────────────────────────

  @state() private _rows: Row[] = [];
  @state() private _originalRows: Row[] = [];
  @state() private _columns: CoreColumn[] = [];
  @state() private _selected: Set<string> = new Set();
  @state() private _page = 0;

  private _columnObserver: MutationObserver | null = null;
  private _columnChangeHandler = () => this._readColumns();

  // ── Public properties ────────────────────────────────────────────────────

  set rows(value: Row[]) {
    const prev = this._rows;
    this._originalRows = [...value];
    this._rows = this.sortByAttr
      ? this._applySortToRows([...value])
      : [...value];
    if (!this.preservePage) this._page = 0;
    if (!this.preserveSelection) {
      // Prune selected keys that no longer exist in the new rows
      const keySet = new Set(value.map((r, i) => this._rowKey(r, i)));
      this._selected = new Set([...this._selected].filter((k) => keySet.has(k)));
    }
    this.requestUpdate('_rows', prev);
  }

  get rows(): Row[] {
    return this._rows;
  }

  set selected(value: Set<string>) {
    const prev = new Set(this._selected);
    const added = [...value].filter((k) => !prev.has(k));
    const removed = [...prev].filter((k) => !value.has(k));
    this._selected = new Set(value);
    this.requestUpdate('_selected', prev);
    this._fireSelectionChange(added, removed);
  }

  get selected(): Set<string> {
    return this._selected;
  }

  set page(value: number) {
    this._page = value;
    this.requestUpdate('_page', this._page);
  }

  get page(): number {
    return this._page;
  }

  get totalRows(): number {
    return this._rows.length;
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback(): void {
    super.connectedCallback();
    // Observe child list changes (columns added/removed)
    this._columnObserver = new MutationObserver(() => this._readColumns());
    this._columnObserver.observe(this, { childList: true, subtree: false });
    // Listen for attribute mutations on existing columns
    this.addEventListener('core-column-changed', this._columnChangeHandler);
    queueMicrotask(() => this._readColumns());
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._columnObserver?.disconnect();
    this._columnObserver = null;
    this.removeEventListener('core-column-changed', this._columnChangeHandler);
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /** Force re-read of <core-column> children + re-render. */
  refresh(): void {
    this._readColumns();
  }

  clearSelection(): void {
    const removed = [...this._selected];
    this._selected = new Set();
    this.requestUpdate('_selected', new Set(removed));
    this._fireSelectionChange([], removed);
  }

  selectAll(): void {
    if (this.selection !== 'multi') return;
    const visible = this._visibleRows();
    const added: string[] = [];
    const next = new Set(this._selected);
    visible.forEach((r, i) => {
      const k = this._rowKey(r, this._globalIndex(i));
      if (!next.has(k)) { next.add(k); added.push(k); }
    });
    this._selected = next;
    this.requestUpdate('_selected', new Set());
    if (added.length) this._fireSelectionChange(added, []);
  }

  selectNone(): void {
    this.clearSelection();
  }

  /** Programmatic sort. If dir omitted, cycles: asc → desc → null. */
  sortBy(key: string, dir?: SortDir): void {
    if (!dir) {
      if (this.sortByAttr === key) {
        dir = this.sortDirAttr === 'asc' ? 'desc' : undefined;
      } else {
        dir = 'asc';
      }
    }
    this._applySort(key, dir ?? null);
  }

  // ── Internal helpers ─────────────────────────────────────────────────────

  private _readColumns(): void {
    this._columns = Array.from(this.querySelectorAll('core-column')) as unknown as CoreColumn[];
    this.requestUpdate('_columns', []);
  }

  private _rowKey(row: Row, index: number): string {
    if (this.keyField && this.keyField !== '' && row[this.keyField] !== undefined) {
      return String(row[this.keyField]);
    }
    return String(index);
  }

  private _globalIndex(visibleIndex: number): number {
    if (this.pageSize > 0) {
      return this._page * this.pageSize + visibleIndex;
    }
    return visibleIndex;
  }

  private _visibleRows(): Row[] {
    if (this.pageSize > 0) {
      return pageSlice(this._rows, this._page, this.pageSize);
    }
    return this._rows;
  }

  private _applySortToRows(rows: Row[]): Row[] {
    if (!this.sortByAttr) return rows;
    const col = this._columns.find((c) => (c as any).key === this.sortByAttr);
    const type: ColumnType = (col as any)?.type ?? 'text';
    const customFn = (col as any)?.sortFn;
    return sortRows(rows, this.sortByAttr, type, this.sortDirAttr, customFn);
  }

  private _applySort(key: string | null, dir: SortDir | null): void {
    const previousKey = this.sortByAttr;
    const previousDir = this.sortDirAttr;

    const event = new CustomEvent('core-sort-change', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: { key, dir, previousKey, previousDir },
    });
    this.dispatchEvent(event);

    // Reflect attrs regardless of cancel (consumer uses these for their UI state)
    this.sortByAttr = key;
    this.sortDirAttr = dir ?? 'asc';

    if (!event.defaultPrevented) {
      if (key === null) {
        // Restore original order
        this._rows = [...this._originalRows];
      } else {
        this._rows = this._applySortToRows([...this._originalRows]);
      }
      this.requestUpdate('_rows', []);
    }
  }

  private _fireSelectionChange(added: string[], removed: string[]): void {
    this.dispatchEvent(new CustomEvent('core-selection-change', {
      bubbles: true,
      composed: true,
      detail: { selected: new Set(this._selected), added, removed },
    }));
  }

  private _onHeaderClick(colKey: string): void {
    // Tri-state cycle: unsorted → asc → desc → unsorted
    let nextDir: SortDir | null;
    if (this.sortByAttr !== colKey) {
      nextDir = 'asc';
    } else if (this.sortDirAttr === 'asc') {
      nextDir = 'desc';
    } else {
      nextDir = null; // unsorted
    }
    this._applySort(nextDir === null ? null : colKey, nextDir);
  }

  private _onHeaderKeydown(e: KeyboardEvent, colKey: string): void {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._onHeaderClick(colKey);
    }
  }

  private _onRowKeydown(e: KeyboardEvent, row: Row, globalIndex: number, visibleRows: Row[]): void {
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const next = this.shadowRoot?.querySelector(`[part~="row"][data-index="${globalIndex + 1}"]`) as HTMLElement | null;
        next?.focus();
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prev = this.shadowRoot?.querySelector(`[part~="row"][data-index="${globalIndex - 1}"]`) as HTMLElement | null;
        prev?.focus();
        break;
      }
      case 'Home': {
        e.preventDefault();
        const firstIdx = this._globalIndex(0);
        const first = this.shadowRoot?.querySelector(`[part~="row"][data-index="${firstIdx}"]`) as HTMLElement | null;
        first?.focus();
        break;
      }
      case 'End': {
        e.preventDefault();
        const lastIdx = this._globalIndex(visibleRows.length - 1);
        const last = this.shadowRoot?.querySelector(`[part~="row"][data-index="${lastIdx}"]`) as HTMLElement | null;
        last?.focus();
        break;
      }
      case ' ': {
        e.preventDefault();
        if (this.selection !== 'none') this._toggleSelection(row, globalIndex);
        break;
      }
      case 'Enter': {
        e.preventDefault();
        const key = this._rowKey(row, globalIndex);
        this.dispatchEvent(new CustomEvent('core-row-click', {
          bubbles: true, composed: true,
          detail: { row, key, event: e },
        }));
        break;
      }
    }
  }

  private _toggleSelection(row: Row, globalIndex: number): void {
    const key = this._rowKey(row, globalIndex);
    const next = new Set(this._selected);
    if (this.selection === 'single') {
      const removed = [...next];
      next.clear();
      if (!this._selected.has(key)) {
        next.add(key);
        this._selected = next;
        this._fireSelectionChange([key], removed);
      } else {
        this._selected = next;
        this._fireSelectionChange([], removed);
      }
    } else if (this.selection === 'multi') {
      if (next.has(key)) {
        next.delete(key);
        this._selected = next;
        this._fireSelectionChange([], [key]);
      } else {
        next.add(key);
        this._selected = next;
        this._fireSelectionChange([key], []);
      }
    }
    this.requestUpdate('_selected', new Set());
  }

  private _onRowClick(row: Row, globalIndex: number, e: MouseEvent): void {
    const key = this._rowKey(row, globalIndex);
    this.dispatchEvent(new CustomEvent('core-row-click', {
      bubbles: true, composed: true,
      detail: { row, key, event: e },
    }));
    if (!this.noRowClickSelect && this.selection === 'single') {
      this._toggleSelection(row, globalIndex);
    }
  }

  private _onSelectAllChange(e: Event): void {
    const cb = e.target as HTMLInputElement;
    if (cb.checked) {
      this.selectAll();
    } else {
      this.clearSelection();
    }
  }

  private _onPageChange(newPage: number): void {
    this._page = newPage;
    this.requestUpdate('_page', this._page);
    this.dispatchEvent(new CustomEvent('core-page-change', {
      bubbles: true, composed: true,
      detail: { page: newPage, pageSize: this.pageSize, totalRows: this.totalRows },
    }));
  }

  // ── CSS ──────────────────────────────────────────────────────────────────

  static override styles = css`
    :host {
      display: block;
      overflow: auto;
      --pad: var(--core-table-cell-padding-cozy, 8px 12px);
    }
    :host([density="comfortable"]) { --pad: var(--core-table-cell-padding-comfortable, 12px 16px); }
    :host([density="compact"])     { --pad: var(--core-table-cell-padding-compact, 4px 8px); }

    [part="table"] {
      width: 100%;
      border-collapse: collapse;
      border-spacing: 0;
    }

    [part="header"] {
      background: var(--core-table-header-bg, var(--core-ink-2));
    }

    :host([sticky-header]) [part="header"] {
      position: sticky;
      top: 0;
      z-index: 1;
      background: var(--core-table-header-bg, var(--core-ink-2));
    }

    [part="header-cell"] {
      padding: var(--pad);
      text-align: start;
      font-weight: 600;
      color: var(--core-table-header-fg, var(--core-fg-1));
      border-bottom: 1px solid var(--core-table-border, var(--core-line-1));
      white-space: nowrap;
      user-select: none;
    }

    [part="header-cell"][data-align="center"] { text-align: center; }
    [part="header-cell"][data-align="end"]    { text-align: end; }

    [part="header-cell"][data-sortable] {
      cursor: pointer;
    }
    [part="header-cell"][data-sortable]:hover {
      background: var(--core-table-row-bg-hover, var(--core-ink-1));
    }

    .sort-indicator { margin-inline-start: 4px; font-size: 0.75em; }

    [part="body"] {}

    [part="row"] {
      background: var(--core-table-row-bg, transparent);
      border-bottom: 1px solid var(--core-table-border, var(--core-line-1));
      cursor: default;
    }
    [part="row"]:hover {
      background: var(--core-table-row-bg-hover, var(--core-ink-1));
    }
    [part~="row"][data-selected] {
      background: var(--core-table-row-bg-selected,
        color-mix(in oklch, var(--core-brand-500, oklch(0.6 0.15 270)) 12%, transparent));
    }
    [part~="row"][data-selected]:hover {
      background: color-mix(in oklch,
        var(--core-table-row-bg-selected,
          color-mix(in oklch, var(--core-brand-500, oklch(0.6 0.15 270)) 12%, transparent)),
        var(--core-table-row-bg-hover, var(--core-ink-1)) 50%);
    }
    [part~="row"]:focus {
      outline: 2px solid var(--core-brand-500, oklch(0.6 0.15 270));
      outline-offset: -2px;
    }

    [part="cell"] {
      padding: var(--pad);
      color: var(--core-fg-0, inherit);
      border-bottom: 1px solid var(--core-table-border, var(--core-line-1));
      vertical-align: middle;
    }
    [part="cell"][data-align="center"] { text-align: center; }
    [part="cell"][data-align="end"]    { text-align: end; }

    [part~="loading"] {
      position: relative;
    }
    [part~="loading"] tbody {
      opacity: 0.5;
      pointer-events: none;
    }
    .loading-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    [part="empty"] {
      padding: var(--pad);
      text-align: center;
      color: var(--core-fg-3, inherit);
    }

    [part="pagination"] {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 4px;
      padding: 8px 0;
      flex-wrap: wrap;
    }
    .pagination-range {
      margin-inline-end: 8px;
      color: var(--core-fg-2, inherit);
      font-size: 0.875em;
    }
    .pagination-btn {
      min-width: 2rem;
      padding: 2px 6px;
      border: 1px solid var(--core-table-border, var(--core-line-1));
      background: transparent;
      border-radius: 4px;
      cursor: pointer;
      font: inherit;
    }
    .pagination-btn[data-active] {
      background: var(--core-brand-500, oklch(0.6 0.15 270));
      color: white;
      border-color: var(--core-brand-500, oklch(0.6 0.15 270));
    }
    .pagination-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .select-cell {
      width: 2.5rem;
      text-align: center;
    }
  `;

  // ── Render helpers ───────────────────────────────────────────────────────

  private _renderHeaderCell(col: CoreColumn, _colIndex: number): TemplateResult {
    const key = (col as any).key as string;
    const label = (col as any).resolvedLabel as string;
    const sortable = (col as any).sortable as boolean;
    const align = (col as any).align as string ?? 'start';
    const width = (col as any).width as string;
    const isSorted = this.sortByAttr === key;
    const sortIndicator = isSorted
      ? (this.sortDirAttr === 'asc' ? ' ▲' : ' ▼')
      : '';
    const ariaSortValue = isSorted
      ? (this.sortDirAttr === 'asc' ? 'ascending' : 'descending')
      : 'none';

    return html`
      <th
        part="header-cell"
        role="columnheader"
        style=${width ? `width:${width}` : ''}
        data-align=${align}
        ?data-sortable=${sortable}
        aria-sort=${sortable ? ariaSortValue : nothing}
        tabindex=${sortable ? '0' : nothing}
        @click=${sortable ? () => this._onHeaderClick(key) : nothing}
        @keydown=${sortable ? (e: KeyboardEvent) => this._onHeaderKeydown(e, key) : nothing}
      >
        ${label}<span class="sort-indicator" aria-hidden="true">${sortIndicator}</span>
      </th>
    `;
  }

  private _renderCell(row: Row, col: CoreColumn, colIndex: number, rowIndex: number, isSelected: boolean): TemplateResult {
    const key = (col as any).key as string;
    const type: ColumnType = (col as any).type ?? 'text';
    const align = (col as any).align ?? 'start';
    // T4 deviation: column uses `cellRender` (not `render`) to avoid collision
    // with LitElement's render() method.
    const renderFn = (col as any).cellRender;
    const ctx = { rowIndex, columnIndex: colIndex, isSelected };

    let content: TemplateResult | string;
    if (renderFn) {
      const result = renderFn(row, ctx);
      content = result !== undefined ? result : defaultFormat(row[key], type);
    } else {
      content = defaultFormat(row[key], type);
    }

    return html`
      <td part="cell" role="cell" data-align=${align}>
        ${typeof content === 'string' ? content : content}
      </td>
    `;
  }

  private _renderSelectionHeaderCell(): TemplateResult {
    if (this.selection === 'none') return html``;
    if (this.selection === 'single') {
      return html`<th part="header-cell" class="select-cell" role="columnheader"></th>`;
    }
    // multi — tri-state checkbox
    const visible = this._visibleRows();
    const selectedCount = visible.filter((r, i) =>
      this._selected.has(this._rowKey(r, this._globalIndex(i)))
    ).length;
    const allSelected = visible.length > 0 && selectedCount === visible.length;
    const someSelected = selectedCount > 0 && !allSelected;

    return html`
      <th part="header-cell" class="select-cell" role="columnheader">
        <input
          type="checkbox"
          .indeterminate=${someSelected}
          .checked=${allSelected}
          aria-label="Select all rows on this page"
          @change=${(e: Event) => this._onSelectAllChange(e)}
        />
      </th>
    `;
  }

  private _renderSelectionCell(row: Row, globalIndex: number): TemplateResult {
    if (this.selection === 'none') return html``;
    const key = this._rowKey(row, globalIndex);
    const isSelected = this._selected.has(key);

    if (this.selection === 'single') {
      return html`
        <td part="cell" class="select-cell" role="cell">
          <input
            type="radio"
            name="core-table-${this._uid}"
            .checked=${isSelected}
            aria-label="Select row ${key}"
            @change=${() => this._toggleSelection(row, globalIndex)}
          />
        </td>
      `;
    }

    return html`
      <td part="cell" class="select-cell" role="cell">
        <input
          type="checkbox"
          .checked=${isSelected}
          aria-label="Select row ${key}"
          @change=${() => this._toggleSelection(row, globalIndex)}
        />
      </td>
    `;
  }

  private _renderPagination(): TemplateResult {
    if (this.pageSize <= 0) return html``;
    const total = this.totalRows;
    const pages = pageCount(total, this.pageSize);
    const start = this._page * this.pageSize + 1;
    const end = Math.min((this._page + 1) * this.pageSize, total);
    const window = pageWindow(this._page, pages);

    return html`
      <div part="pagination" role="navigation" aria-label="Table pagination">
        <span class="pagination-range">Showing ${start}–${end} of ${total}</span>
        <button
          class="pagination-btn"
          aria-label="Previous page"
          ?disabled=${this._page === 0}
          @click=${() => this._onPageChange(this._page - 1)}
        >‹</button>
        ${window.map((p) => p === 'gap'
          ? html`<span aria-hidden="true">…</span>`
          : html`
            <button
              class="pagination-btn"
              ?data-active=${p === this._page}
              aria-current=${p === this._page ? 'page' : nothing}
              @click=${() => this._onPageChange(p as number)}
            >${(p as number) + 1}</button>
          `
        )}
        <button
          class="pagination-btn"
          aria-label="Next page"
          ?disabled=${this._page >= pages - 1}
          @click=${() => this._onPageChange(this._page + 1)}
        >›</button>
      </div>
    `;
  }

  // ── Main render ──────────────────────────────────────────────────────────

  override render() {
    const visibleCols = this._columns.filter((c) => !(c as any).hidden);
    const visibleRows = this._visibleRows();
    const colCount = visibleCols.length + (this.selection !== 'none' ? 1 : 0);
    const total = this.totalRows;

    return html`
      <slot name="header"></slot>

      <div
        part="table ${this.loading ? 'loading' : ''}"
        role="none"
        style="position:relative"
      >
        <table
          role="table"
          aria-rowcount=${total}
          style="width:100%;border-collapse:collapse"
        >
          <thead part="header" role="rowgroup">
            <tr part="header-row" role="row">
              ${this._renderSelectionHeaderCell()}
              ${visibleCols.map((col, i) => this._renderHeaderCell(col, i))}
            </tr>
          </thead>

          <tbody part="body" role="rowgroup"
            style=${this.loading ? 'opacity:0.5;pointer-events:none' : ''}
          >
            ${!this.loading && visibleRows.length === 0
              ? html`
                <tr role="row">
                  <td part="empty" role="cell" colspan=${colCount}>
                    <slot name="empty"><div>No data.</div></slot>
                  </td>
                </tr>
              `
              : visibleRows.map((row, vi) => {
                  const gi = this._globalIndex(vi);
                  const key = this._rowKey(row, gi);
                  const isSelected = this._selected.has(key);
                  return html`
                    <tr
                      part=${isSelected ? 'row row-selected' : 'row'}
                      role="row"
                      tabindex="0"
                      data-index=${gi}
                      ?data-selected=${isSelected}
                      aria-selected=${this.selection !== 'none' ? String(isSelected) : nothing}
                      aria-rowindex=${gi + 1}
                      @click=${(e: MouseEvent) => this._onRowClick(row, gi, e)}
                      @keydown=${(e: KeyboardEvent) => this._onRowKeydown(e, row, gi, visibleRows)}
                    >
                      ${this._renderSelectionCell(row, gi)}
                      ${visibleCols.map((col, ci) => this._renderCell(row, col, ci, gi, isSelected))}
                    </tr>
                  `;
                })
            }
          </tbody>
        </table>

        ${this.loading
          ? html`
            <div class="loading-overlay" part="loading">
              <slot name="loading"><div>Loading…</div></slot>
            </div>
          `
          : nothing
        }
      </div>

      <slot name="footer"></slot>

      <slot name="pagination">
        ${this._renderPagination()}
      </slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'core-data-table': CoreDataTable;
  }
}
