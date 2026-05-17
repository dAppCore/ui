// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.8 — no upstream in core/ide.

/**
 * `@dappcore/ui/surfaces` — overlay + anchored Web Components.
 *
 * v0.8 surfaces tier:
 *   - <core-dialog>   modal/non-modal dialog with size variants
 *   - <core-drawer>   edge-attached panel (start|end|top|bottom)
 *   - <core-popover>  anchored floating panel, 12 placements
 *   - <core-tooltip>  hover/focus descriptor, auto aria-describedby
 *
 * Usage:
 *
 *   import '@dappcore/ui/surfaces';
 *
 *   import { CoreDialog } from '@dappcore/ui/surfaces';
 *   import { CoreOverlayElement } from '@dappcore/ui/surfaces';
 *   import { createFocusTrap } from '@dappcore/ui/surfaces/_shared/focus-trap';
 */

// Shared base classes
export { CoreOverlayElement } from './_shared/overlay-element';
export { CoreAnchoredElement } from './_shared/anchored-element';

// Pure utilities
export { createFocusTrap, type FocusTrap } from './_shared/focus-trap';
export {
  supportsAnchorPositioning,
  computePosition,
  type Placement,
  type PositionResult,
} from './_shared/anchor-position';

// v0.8 — side-effect imports define the custom elements
import './dialog';
import './drawer';
import './popover';
import './tooltip';

// Re-export classes + types for typed consumers.
export { CoreDialog, type DialogSize } from './dialog';
export { CoreDrawer, type DrawerSide } from './drawer';
export { CorePopover } from './popover';
export { CoreTooltip } from './tooltip';
