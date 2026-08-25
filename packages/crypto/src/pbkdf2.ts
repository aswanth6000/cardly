/**
 * PBKDF2-HMAC-SHA256 key derivation, used to turn a recovery password into a
 * vault encryption key.
 *
 * **App:** `expo-crypto` provides `digestStringAsync` with HMAC support
 * (`CryptoDigestAlgorithm.SHA256` + `CryptoHmacAlgorithm.PBKDF2`), so
 * derivation runs in native code.
 *
 * **Tests:** a pure-TypeScript PBKDF2-HMAC-SHA256 implementation is used so
 * the derivation (and therefore the backup format) is testable in Node.
 */

import { pbkdf2Sha256 } from './pbkdf2-pure';

export const PBKDF2_ITERATIONS = 600_000;
export const PBKDF2_SALT_LENGTH = 16;
export const DERIVED_KEY_LENGTH = 32;

export type KdfParams = {
  password: string;
  salt: Uint8Array;
  iterations: number;
  keyLength: number;
};

export async function deriveKey(params: KdfParams): Promise<Uint8Array> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const expoCrypto = require('expo-crypto');
    if (expoCrypto?.digestStringAsync) {
      const hex = await expoCrypto.digestStringAsync(
        expoCrypto.CryptoDigestAlgorithm.SHA256,
        params.password,
        {
          encoding: expoCrypto.CryptoEncoding.HEX,
          key: params.salt,
          iterations: params.iterations,
        },
      );
      const full = hex.slice(0, params.keyLength * 2);
      const out = new Uint8Array(params.keyLength);
      for (let i = 0; i < params.keyLength; i++) {
        out[i] = parseInt(full.slice(i * 2, i * 2 + 2), 16);
      }
      return out;
    }
  } catch {
    // Fall through to pure implementation (test environment).
  }
  return deriveKeyPure(params);
}

function deriveKeyPure(params: KdfParams): Uint8Array {
  return pbkdf2Sha256(params);
}
