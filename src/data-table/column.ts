// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.3 — no upstream in core/ide.
import { LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ColumnType, SortDir } from './_shared/sort';

export type ColumnAlign = 'start' | 'center' | 'end';

export interface ColumnRenderContext {
  rowIndex: number;
  columnIndex: number;
  isSelected: boolean;
}

/**
 * `<core-column>` — light-DOM metadata-only child of `<core-data-table>`.
 *
 * Never renders anything itself. <core-data-table> reads this element's
 * attributes and JS properties to build the table's column definitions.
 *
 * Attributes (reflected): key, label, sortable, type, align, width, hidden
 * JS-only properties:
 *   cellRender — custom per-cell render function. Spec §4.2 calls this
 *     "render" for consumer ergonomics, but it conflicts with LitElement's
 *     render() method, so the implementation uses `cellRender` instead.
 *   sortFn — custom comparator override.
 *
 * Fires `core-column-changed` (bubbles, composed) on any observed attribute
 * mutation so the parent table can call refresh() without polling.
 *
 *   <core-column key="name"    label="Name"     sortable></core-column>
 *   <core-column key="created" label="Created"  sortable type="date"></core-column>
 *   <core-column key="score"   label="Score"    sortable type="number" align="end"></core-column>
 *   <core-column key="actions" label="" width="80px"></core-column>
 *
 * Custom cell render (JS):
 *   const col = document.querySelector('core-column[key="actions"]');
 *   col.cellRender = (row, ctx) => html`<button>Edit ${row.id}</button>`;
 */
@customElement('core-column')
export class CoreColumn extends LitElement {
  // Light DOM — no shadow root
  protected override createRenderRoot() {
    return this;
  }

  @property({ reflect: true }) key = '';
  @property({ reflect: true }) label: string | undefined = undefined;

  get resolvedLabel(): string {
    return this.label || this.key;
  }

  @property({ reflect: true, type: Boolean }) sortable = false;
  @property({ reflect: true }) type: ColumnType = 'text';
  @property({ reflect: true }) align: ColumnAlign = 'start';
  @property({ reflect: true }) width = '';
  @property({ reflect: true, type: Boolean }) override hidden = false;

  /**
   * Custom render function for this column's cells. Called with (row, ctx).
   * Return a Lit TemplateResult, a string, or undefined (falls back to
   * type-aware default rendering in the parent table).
   *
   * Named `cellRender` (not `render`) to avoid colliding with LitElement's
   * render() method.
   */
  cellRender:
    | ((
        row: Record<string, unknown>,
        ctx: ColumnRenderContext,
      ) => TemplateResult | string | undefined)
    | undefined = undefined;

  /**
   * Custom sort comparator. Called by the parent table when sorting this
   * column. Receives (a: Row, b: Row, dir: SortDir) — must return a number
   * (negative = a first, positive = b first, 0 = equal).
   */
  sortFn:
    | ((
        a: Record<string, unknown>,
        b: Record<string, unknown>,
        dir: SortDir,
      ) => number)
    | undefined = undefined;

  private _observer: MutationObserver | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this._observer = new MutationObserver(() => {
      this.dispatchEvent(
        new CustomEvent('core-column-changed', {
          bubbles: true,
          composed: true,
        }),
      );
    });
    this._observer.observe(this, { attributes: true });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._observer?.disconnect();
    this._observer = null;
  }

  // Light DOM with no content — render returns nothing (empty template).
  // We don't have a JSDoc on this method because the JSDoc on the class +
  // the cellRender field comment cover the semantics.
  override render(): TemplateResult | undefined {
    return undefined;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'core-column': CoreColumn;
  }
}
