// SPDX-Licence-Identifier: EUPL-1.2

/**
 * `@dappcore/ui/primitives` — Web Component primitives for CoreUI v0.5.
 *
 * Importing this module side-effects: defines every <core-*> custom
 * element and registers the 12 default icons. Consumers also import
 * `@dappcore/ui/primitives/index.css` (or individual `.css` paths) for
 * default styling.
 *
 *   import '@dappcore/ui/primitives';
 *   import '@dappcore/ui/primitives/index.css';
 *
 *   import { registerIcon } from '@dappcore/ui/primitives';
 *   registerIcon('rocket', '<svg viewBox="0 0 16 16">...</svg>');
 */

// Shared
export { CoreElement, PART, type PartName } from './_shared';

// Icon registry
export {
  registerIcon, getIcon, listIcons, unregisterIcon, type IconEntry,
} from './icons/registry';
export {
  registerDefaultIcons, DEFAULT_ICON_NAMES, type DefaultIconName,
} from './icons/defaults';

// Primitives — side-effect imports define the custom elements.
import './status-dot';
import './pill';
import './label';
import './card';
import './glass';
import './icon';
import './button';
import './toggle';
import './rail';
import './window-controls';
import './sparkline';

// Re-export classes + types for typed consumers.
export { CoreStatusDot, type StatusDotState, type StatusDotSize } from './status-dot';
export { CorePill, type PillState, type PillSize } from './pill';
export { CoreLabel, type LabelSize } from './label';
export { CoreCard, type CardElevation, type CardPadding } from './card';
export { CoreGlass } from './glass';
export { CoreIcon, type IconSize } from './icon';
export { CoreButton, type ButtonVariant, type ButtonSize, type ButtonType } from './button';
export { CoreToggle, type ToggleSize } from './toggle';
export { CoreRail } from './rail';
export {
  CoreWindowControls, type WindowPlatform, type WindowState,
} from './window-controls';
export { CoreSparkline, type SparklineKind } from './sparkline';
