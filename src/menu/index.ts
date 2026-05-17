// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.9 — no upstream in core/ide.

/**
 * `@dappcore/ui/menu` — menu Web Components.
 *
 * v0.9 menu tier:
 *   - <core-menu>           Shadow DOM container (state + ARIA + keyboard nav + type-ahead)
 *   - <core-menuitem>       Light DOM trigger (click delegation, slots for icon/label/trailing)
 *   - <core-menu-separator> Light DOM divider (role="separator", no interaction)
 *
 * Registration order is load-order-dependent for custom elements:
 * menuitem + menu-separator imported BEFORE menu so children are defined when the
 * parent <core-menu> first reads its slotted children on connectedCallback.
 *
 * Usage:
 *
 *   import '@dappcore/ui/menu';
 *
 *   import { CoreMenu } from '@dappcore/ui/menu';
 *   import { CoreMenuitem } from '@dappcore/ui/menu/menuitem';
 *   import { CoreMenuSeparator } from '@dappcore/ui/menu/menu-separator';
 */

// Children must be defined before the parent — registration order matters.
import './menuitem';
import './menu-separator';
import './menu';

// Re-export classes + types for typed consumers.
export { CoreMenuitem } from './menuitem';
export { CoreMenuSeparator } from './menu-separator';
export { CoreMenu, type MenuOrientation } from './menu';
