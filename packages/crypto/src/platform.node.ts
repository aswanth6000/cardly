/**
 * Random number generation.
 *
 * The Node.js `crypto` module is available in the vitest environment, so we
 * use it directly for tests and non-Expo contexts.
 */
export function getRandomBytes(byteCount: number): Uint8Array {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('node:crypto').randomBytes(byteCount);
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
  return Buffer.from(getDeterministicBytes(byteLength)).toString('hex');
}

/** RFC 4122 v4 UUID (Node's crypto is fine for tests). */
export function randomUUID(): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('node:crypto').randomUUID();
}
