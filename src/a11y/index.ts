// SPDX-Licence-Identifier: EUPL-1.2

export { announce } from './announce';
export { saveFocus, restoreFocus, type FocusHandle } from './focus';
export {
  prefersReducedMotion, prefersContrast, prefersColorScheme,
  PrefersReducedMotionController, PrefersDarkController,
} from './prefers';
export { generateId, setAriaLabel, linkLabelledBy } from './aria';
