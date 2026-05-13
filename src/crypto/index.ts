// SPDX-Licence-Identifier: EUPL-1.2

/**
 * Cryptographic primitives — lthnHash + QuasiSalt.
 *
 * The polyglot dappco.re stack carries this same algorithm on every
 * side (Go, PHP, TypeScript). Outputs are byte-identical given the
 * same input + keymap. See {@link lthnHash} for the contract.
 */

export { createSalt, QUASI_SALT_KEYMAP, type QuasiSaltOptions } from './quasi-salt.js';
export { lthnHash, verify, type LthnHashOptions } from './lthn-hash.js';
