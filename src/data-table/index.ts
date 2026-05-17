// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.3 — no upstream in core/ide.

/**
 * `@dappcore/ui/data-table` — data-presentation Web Components.
 *
 * v0.3 data-table tier:
 *   - <core-data-table>   Shadow DOM host with sort, pagination, selection
 *   - <core-column>       Light-DOM declarative column definition
 *
 * Pure utilities (importable individually):
 *   - _shared/sort        getComparator, sortRows
 *   - _shared/pagination  pageCount, pageSlice, pageWindow
 *
 * Usage:
 *
 *   import '@dappcore/ui/data-table';
 *
 *   import { CoreDataTable } from '@dappcore/ui/data-table';
 *   import { sortRows } from '@dappcore/ui/data-table/_shared/sort';
 *   import { pageWindow } from '@dappcore/ui/data-table/_shared/pagination';
 *
 * Note: <core-column> exposes `cellRender` (not `render`, which would
 * collide with LitElement's render method) for custom per-cell rendering.
 */

// Pure utilities
export {
  getComparator,
  sortRows,
  type SortDir,
  type ColumnType,
} from './_shared/sort';

export {
  pageCount,
  pageSlice,
  pageWindow,
} from './_shared/pagination';

// v0.3 — side-effect imports define the custom elements
import './column';
import './data-table';

// Re-export classes + types for typed consumers
export { CoreColumn, type ColumnAlign, type ColumnRenderContext } from './column';
export { CoreDataTable, type SelectionMode, type DensityMode, type Row } from './data-table';
