/**
 * Vault key management.
 *
 * Every Cardly vault has exactly one random 256-bit AES key (`vaultKey`).
 * That key is the only thing that can decrypt the vault.
 *
 * Key hierarchy:
 *
 * ```text
 * vaultKey (random, 32 bytes, generated once at vault creation)
 *   ├── stored in platform SecureStore (iOS Keychain / Android Keystore)
 *   └── wrapped by a recovery key (PBKDF2 from the user's recovery password)
 *        └── written into the vault header for encrypted export/restore
 * ```
 *
 * The recovery password never leaves the device and Cardly can never recover
 * it: losing the device and the password means losing the vault.
 */
import { bytesToBase64, bytesToHex, hexToBytes } from './encoding';
import { PBKDF2_ITERATIONS, PBKDF2_SALT_LENGTH, deriveKey } from './pbkdf2';
import { getRandomBytes } from './platform';
import { decryptString, encryptString } from './aes-gcm';
import type { RawKey } from './encoding';

export interface RecoveryConfig {
  salt: string;
  iterations: number;
}

export async function createVaultKey(): Promise<RawKey> {
  return getRandomBytes(32) as RawKey;
}

export async function wrapVaultKey(
  vaultKey: RawKey,
  password: string,
  iterations: number = PBKDF2_ITERATIONS,
): Promise<{ wrapped: string; config: RecoveryConfig }> {
  const salt = getRandomBytes(PBKDF2_SALT_LENGTH);
  const recoveryKey = await deriveKey({
    password,
    salt,
    iterations,
    keyLength: 32,
  });
  const wrapped = await encryptString(bytesToHex(vaultKey), recoveryKey as RawKey);
  return { wrapped, config: { salt: bytesToBase64(salt), iterations } };
}

export async function unwrapVaultKey(
  wrapped: string,
  password: string,
  config: RecoveryConfig,
): Promise<RawKey> {
  const salt = base64ToBytesLoose(config.salt);
  const recoveryKey = await deriveKey({
    password,
    salt,
    iterations: config.iterations,
    keyLength: 32,
  });
  const hex = await decryptString(wrapped, recoveryKey as RawKey);
  return hexToBytes(hex) as RawKey;
}

function base64ToBytesLoose(b64: string): Uint8Array {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}
