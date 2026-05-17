// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.10 — no upstream in core/ide.

/**
 * `@dappcore/ui/toast` — toast notification Web Components + programmatic helper.
 *
 * v0.10 toast tier:
 *   - <core-toast>        Shadow DOM bubble with state machine + timer
 *   - <core-toast-region> Shadow DOM container with 6 corner positions
 *   - toast               Programmatic helper (singleton region)
 *
 * Registration order: toast and toast-region are sibling elements with no
 * parent/child registration dependency. Import toast first (core bubble)
 * then toast-region (container) so the helper's document.createElement
 * calls resolve in consistent order.
 *
 * Usage:
 *   import '@dappcore/ui/toast';
 *   import { toast } from '@dappcore/ui/toast';
 *   import { CoreToast } from '@dappcore/ui/toast/toast';
 *   import { CoreToastRegion } from '@dappcore/ui/toast/toast-region';
 *   import { toast } from '@dappcore/ui/toast/toast-helper';
 */

// Side-effect imports — registers custom elements.
import './toast';
import './toast-region';

// Named re-exports — classes, types, helper.
export { CoreToast } from './toast';
export type { Severity } from './toast';
export { CoreToastRegion } from './toast-region';
export type { ToastPosition } from './toast-region';
export { toast } from './toast-helper';
export type { ToastOptions, ToastAPI } from './toast-helper';
