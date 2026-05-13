// SPDX-Licence-Identifier: EUPL-1.2

/**
 * UUID v7 — time-sortable 128-bit identifiers.
 *
 * Layout (RFC 9562):
 *
 *   00112233-4455-6677-8899-aabbccddeeff
 *   └─────┬─────┘ └┬┘ └┬┘ └┬┘ └────┬────┘
 *         │       │   │   │        └─ 62-bit random
 *         │       │   │   └────────── 2-bit variant (10 → "10xxxxxx")
 *         │       │   └────────────── 12-bit random
 *         │       └────────────────── 4-bit version (7 → "0111xxxx")
 *         └────────────────────────── 48-bit unix millisecond timestamp
 *
 * Sortable by string comparison because the timestamp prefix lexically
 * orders by time. Server indexes that use UUIDs as primary keys benefit
 * (B-tree inserts always go to the end, no fragmentation).
 *
 * Uses `crypto.getRandomValues` for the random parts (browser-native,
 * cryptographically secure).
 *
 * Usage example:
 *
 *   uuidv7()                              → "0193a4b2-..."
 *   uuidv7At(new Date('2026-01-01'))      → "..." (deterministic timestamp)
 */

/**
 * Generate a UUIDv7 with the current wall-clock timestamp.
 */
export function uuidv7(): string {
  return uuidv7At(Date.now());
}

/**
 * Generate a UUIDv7 with an explicit millisecond timestamp. Useful for
 * tests that need deterministic time prefixes and for reconstructing
 * known-time identifiers.
 *
 * Timestamps are clamped to >= 0 and floored to integer milliseconds.
 * Timestamps above 2^48-1 (year 10889) wrap silently — by then we have
 * bigger problems.
 */
export function uuidv7At(timestampMs: number | Date): string {
  const ms = timestampMs instanceof Date ? timestampMs.getTime() : timestampMs;
  const ts = Math.max(0, Math.floor(Number.isFinite(ms) ? ms : 0));
  const bytes = new Uint8Array(16);

  // Bytes 0..5: 48-bit timestamp, big-endian. JS numbers can represent
  // integers up to 2^53 exactly, so plain bit-shifts via /256/256... are
  // safe without BigInt for the 48-bit range.
  let t = ts;
  for (let i = 5; i >= 0; i--) {
    bytes[i] = t & 0xff;
    t = Math.floor(t / 256);
  }

  // Random tail: 10 bytes of entropy, version + variant nibbles overlaid.
  const random = new Uint8Array(10);
  crypto.getRandomValues(random);

  // Bytes 6..7: 4-bit version (0111) + 12-bit random
  bytes[6] = 0x70 | (random[0]! & 0x0f);
  bytes[7] = random[1]!;

  // Bytes 8..15: 2-bit variant (10) + 62-bit random
  bytes[8] = 0x80 | (random[2]! & 0x3f);
  for (let i = 0; i < 7; i++) bytes[9 + i] = random[3 + i]!;

  return formatUuid(bytes);
}

/**
 * Extract the millisecond timestamp encoded in a UUIDv7. Returns 0 for
 * non-v7 inputs. Useful for sorting / cohort grouping without parsing
 * the full byte structure.
 */
export function uuidv7Timestamp(uuid: string): number {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-/i.test(uuid)) return 0;
  const hex = uuid.slice(0, 8) + uuid.slice(9, 13);
  let ts = 0;
  for (let i = 0; i < hex.length; i += 2) {
    ts = ts * 256 + parseInt(hex.slice(i, i + 2), 16);
  }
  return ts;
}

function formatUuid(bytes: Uint8Array): string {
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
