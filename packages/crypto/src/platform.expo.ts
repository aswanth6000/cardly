/**
 * Random number generation backed by `expo-crypto`.
 *
 * `expo-crypto` uses the platform's cryptographic RNG (Secure Enclave / ARM
 * RNG / WebCrypto) and caps requests at 1024 bytes per call.
 */
import * as Crypto from 'expo-crypto';

export function getRandomBytes(byteCount: number): Uint8Array {
  const bytes = new Uint8Array(byteCount);
  let remaining = byteCount;
  let offset = 0;
  while (remaining > 0) {
    const chunk = Math.min(remaining, 1024);
    const random = Crypto.getRandomBytes(chunk);
    bytes.set(random, offset);
    offset += chunk;
    remaining -= chunk;
  }
  return bytes;
}

export function randomUUID(): string {
  return Crypto.randomUUID();
}
