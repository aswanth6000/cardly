/**
 * Node.js platform implementation.
 *
 * Used in the vitest environment (and any non-Expo context). IMPORTANT: this
 * module must never import `node:*` builtins at the top level — Metro statically
 * imports `./platform.node` from `platform.ts`, and any Node builtin import in
 * this file would fail the native bundle. `globalThis.crypto` is available in
 * Node 18+, so we use that instead; the `require('node:crypto')` fallback below
 * is guarded so Metro never executes it.
 */

function nodeCrypto(): typeof import('node:crypto') | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('node:crypto');
  } catch {
    return null;
  }
}

export function getRandomBytes(byteCount: number): Uint8Array {
  const crypto = globalThis.crypto;
  if (crypto?.getRandomValues) {
    const bytes = new Uint8Array(byteCount);
    crypto.getRandomValues(bytes);
    return bytes;
  }
  const nc = nodeCrypto();
  if (nc) return nc.randomBytes(byteCount);
  throw new Error('No secure random source available');
}

/** Deterministic bytes for tests only. Never use in production code. */
export function getDeterministicBytes(byteCount: number): Uint8Array {
  const bytes = new Uint8Array(byteCount);
  for (let i = 0; i < byteCount; i++) {
    bytes[i] = i % 251;
  }
  return bytes;
}

/** Deterministic hex for tests only. Never use in production code. */
export function getDeterministicHex(byteLength: number): string {
  const bytes = getDeterministicBytes(byteLength);
  let hex = '';
  for (const b of bytes) hex += b.toString(16).padStart(2, '0');
  return hex;
}

/** RFC 4122 v4 UUID (tests only). */
export function randomUUID(): string {
  const crypto = globalThis.crypto;
  if (crypto?.randomUUID) return crypto.randomUUID();
  const nc = nodeCrypto();
  if (nc) return nc.randomUUID();
  // Minimal v4 fallback for very old environments (tests only).
  const bytes = getRandomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const h = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
