// SPDX-Licence-Identifier: EUPL-1.2
// New for @dappcore/ui v0.4 — no upstream in core/ide.

/**
 * `@dappcore/ui/tabs` — tabbed-interface Web Components.
 *
 * v0.4 tabs tier:
 *   - <core-tabs>     Shadow DOM tablist container (owns state + indicator)
 *   - <core-tab>      Light DOM trigger (keyboard nav, ARIA tab role)
 *   - <core-tabpanel> Light DOM panel (hidden toggle, ARIA tabpanel role)
 *
 * Registration order is load-order-dependent for custom elements:
 * tab + tabpanel imported BEFORE tabs so children are defined when the
 * parent <core-tabs> first reads its slotted children on connectedCallback.
 *
 * Usage:
 *
 *   import '@dappcore/ui/tabs';
 *
 *   import { CoreTabs } from '@dappcore/ui/tabs';
 *   import { CoreTab } from '@dappcore/ui/tabs/tab';
 *   import { CoreTabpanel } from '@dappcore/ui/tabs/tabpanel';
 */

// Children must be defined before the parent — registration order matters.
import './tab';
import './tabpanel';
import './tabs';

// Re-export classes + types for typed consumers.
export { CoreTab } from './tab';
export { CoreTabpanel } from './tabpanel';
export { CoreTabs, TabsOrientation, TabsActivation } from './tabs';
