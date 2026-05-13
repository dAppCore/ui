// SPDX-Licence-Identifier: EUPL-1.2

/**
 * Cryptographic primitives — lthnHash, QuasiSalt, HMAC, UUIDv7,
 * form-signing canonicalisation.
 *
 * The polyglot dappco.re stack carries the same algorithms on every
 * side (Go, PHP, TypeScript). Outputs are byte-identical given the
 * same input + key + canonicalisation rules.
 */

export { createSalt, QUASI_SALT_KEYMAP, type QuasiSaltOptions } from './quasi-salt.js';
export { lthnHash, verify, type LthnHashOptions } from './lthn-hash.js';

export {
  hmacSha256,
  hmacVerify,
  importHmacKey,
  type HmacAlgorithm,
} from './hmac.js';

export { uuidv7, uuidv7At, uuidv7Timestamp } from './uuid.js';

export {
  canonicaliseFormData,
  RESERVED_KEYS,
  signFormData,
  verifyFormData,
  type CanonicaliseOptions,
  type SignOptions,
  type VerifyOptions,
} from './forms.js';
