/**
 * AES-256-GCM encryption and decryption.
 *
 * **App:** delegates to `expo-crypto`'s AES-GCM implementation, which is
 * backed by platform native crypto (CommonCrypto / Conscrypt / WebCrypto).
 *
 * **Tests:** a pure-TypeScript, well-reviewed AES-GCM implementation
 * (`aes-gcm.ts`) so crypto behavior can be verified in a Node environment
 * where `expo-crypto` is not available.
 *
 * The file format for sealed data is always:
 *
 * ```text
 * nonce (12 bytes) | ciphertext (variable) | tag (16 bytes)
 * ```
 *
 * This matches `expo-crypto`'s `AESSealedData.combined()` layout, so
 * ciphertexts produced in either environment are interoperable.
 */
import { base64ToBytes, bytesToBase64, bytesToHex, hexToBytes, isBase64, isHex } from './encoding';
import { getRandomBytes } from './platform';
import * as pure from './aes-gcm-pure';
import type { RawKey } from './encoding';

export { getRandomBytes };

export const NONCE_LENGTH = 12;
export const TAG_LENGTH = 16;

export interface Aead {
  seal(plaintext: Uint8Array, key: RawKey, nonce: Uint8Array): Uint8Array;
  open(sealed: Uint8Array, key: RawKey): Uint8Array;
}

function checkNonce(nonce: Uint8Array): void {
  if (nonce.length !== NONCE_LENGTH) {
    throw new Error(`Invalid nonce length: expected ${NONCE_LENGTH}, got ${nonce.length}`);
  }
}

function checkKey(key: Uint8Array): void {
  if (key.length !== 32) {
    throw new Error(`Invalid key length: expected 32 bytes, got ${key.length}`);
  }
}

function checkSealed(sealed: Uint8Array): void {
  if (sealed.length < NONCE_LENGTH + TAG_LENGTH) {
    throw new Error('Sealed data is too short');
  }
}

/**
 * Platform-specific AES-GCM. On native, `expo-crypto`; in tests, the pure
 * TypeScript implementation.
 */
export function getAead(): Aead {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const expoCrypto = require('expo-crypto');
    if (expoCrypto?.AESEncryptionKey && expoCrypto?.aesEncryptAsync) {
      return nativeAead;
    }
  } catch {
    // expo-crypto is not available in the test environment.
  }
  return pureAead;
}

const pureAead: Aead = {
  seal(plaintext, key, nonce) {
    checkNonce(nonce);
    checkKey(key);
    return pure.encrypt(key, nonce, plaintext);
  },
  open(sealed, key) {
    checkSealed(sealed);
    checkKey(key);
    return pure.decrypt(key, sealed);
  },
};

async function nativeSeal(plaintext: Uint8Array, key: RawKey, nonce: Uint8Array): Promise<Uint8Array> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const expoCrypto = require('expo-crypto');
  const aesKey = await expoCrypto.AESEncryptionKey.import(key);
  const sealedData = await expoCrypto.aesEncryptAsync(plaintext, aesKey, {
    nonce: { bytes: nonce },
    tagLength: TAG_LENGTH,
  });
  return new Uint8Array(await sealedData.combined('bytes'));
}

async function nativeOpen(sealed: Uint8Array, key: RawKey): Promise<Uint8Array> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const expoCrypto = require('expo-crypto');
  const aesKey = await expoCrypto.AESEncryptionKey.import(key);
  const sealedData = expoCrypto.AESSealedData.fromCombined(sealed);
  const out = await expoCrypto.aesDecryptAsync(sealedData, aesKey, { output: 'bytes' });
  return new Uint8Array(out);
}

const nativeAead: Aead = {
  seal: (p, k, n) => nativeSeal(p, k, n) as unknown as Uint8Array,
  open: (s, k) => nativeOpen(s, k) as unknown as Uint8Array,
};

export async function seal(
  plaintext: Uint8Array,
  key: RawKey,
  nonce: Uint8Array = getRandomBytes(NONCE_LENGTH),
): Promise<Uint8Array> {
  return getAead().seal(plaintext, key, nonce);
}

export async function open(sealed: Uint8Array, key: RawKey): Promise<Uint8Array> {
  return getAead().open(sealed, key);
}

export const sealBytes = seal;
export const openBytes = open;

export async function encryptString(
  plaintext: string,
  key: RawKey,
  nonce?: Uint8Array,
): Promise<string> {
  const data = new TextEncoder().encode(plaintext);
  const sealed = await seal(data, key, nonce);
  return bytesToBase64(sealed);
}

export async function decryptString(sealedBase64: string, key: RawKey): Promise<string> {
  if (!isBase64(sealedBase64)) throw new Error('Invalid sealed data encoding');
  const sealed = base64ToBytes(sealedBase64);
  const plaintext = await open(sealed, key);
  return new TextDecoder().decode(plaintext);
}

export async function encryptStringToHex(
  plaintext: string,
  key: RawKey,
  nonce?: Uint8Array,
): Promise<string> {
  const data = new TextEncoder().encode(plaintext);
  const sealed = await seal(data, key, nonce);
  return bytesToHex(sealed);
}

export async function decryptStringFromHex(sealedHex: string, key: RawKey): Promise<string> {
  if (!isHex(sealedHex)) throw new Error('Invalid sealed data encoding');
  const sealed = hexToBytes(sealedHex);
  const plaintext = await open(sealed, key);
  return new TextDecoder().decode(plaintext);
}
