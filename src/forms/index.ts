// SPDX-Licence-Identifier: EUPL-1.2

/**
 * `@dappcore/ui/forms` — form-input Web Components.
 *
 * Tier 1 (existing, since v0.2):
 *   - <core-form>    secure-by-default form wrapper (CSRF, HMAC, honeypot, etc.)
 *   - <core-field>   RSA-OAEP field encryption for ultra-sensitive values
 *
 * Tier 2 (v0.7):
 *   - <core-input>         text/email/password/number/tel/url/search
 *   - <core-textarea>      multi-line text
 *   - <core-select>        native inner <select> with slotted <option>
 *   - <core-checkbox>      box-with-tick (different from <core-toggle>)
 *   - <core-radio>         dot-in-circle, paired with <core-radio-group>
 *   - <core-radio-group>   single-selection wrapper, owns ElementInternals
 *
 *   import '@dappcore/ui/forms';
 *
 *   import { CoreInput, type InputType } from '@dappcore/ui/forms';
 *   import { CoreFormElement } from '@dappcore/ui/forms';
 */

// Shared base class
export { CoreFormElement } from './_shared/form-element';

// Existing (v0.2)
export { CoreForm } from './core-form';
export { CoreField } from './core-field';

// v0.7 — side-effect imports define the custom elements
import './input';
import './textarea';
import './select';
import './checkbox';
import './radio';
import './radio-group';

// Re-export classes + types for typed consumers.
export { CoreInput, type InputType, type InputSize } from './input';
export { CoreTextarea, type TextareaSize, type TextareaWrap, type TextareaResize } from './textarea';
export { CoreSelect, type SelectSize } from './select';
export { CoreCheckbox, type CheckboxSize } from './checkbox';
export { CoreRadio, type RadioSize } from './radio';
export { CoreRadioGroup, type RadioGroupOrientation } from './radio-group';
