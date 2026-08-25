/**
 * Encrypted vault backup: serialize and restore.
 *
 * A backup is the serialized vault header — a JSON document containing the
 * encrypted payload plus the recovery-key wrapping (salt, iterations, wrapped
 * vault key). See `docs/backup-format.md` for the exact format.
 *
 * A backup is **only** restorable with the user's recovery password. Cardly
 * never sees or stores that password.
 */
import * as Crypto from '@cardly/crypto';
import type { RawKey } from '@cardly/crypto';
import { Vault, DEFAULT_PBKDF2_ITERATIONS } from '@cardly/vault';
import type { VaultHeader } from '@cardly/vault';

export const BACKUP_FILE_EXTENSION = 'cardly';

export interface BackupResult {
  /** Serialized backup JSON (the vault header, encrypted). */
  json: string;
  /** Suggested file name. */
  fileName: string;
}

/**
 * Create an encrypted backup of the vault.
 *
 * Requires a recovery password so the backup can be restored on another
 * device without Cardly's help. If the vault does not yet have a recovery
 * key, one is created with the given password.
 */
export async function createBackup(vault: Vault, recoveryPassword: string): Promise<BackupResult> {
  const header = vault.serialize();
  if (!header.recovery || !header.wrappedKey) {
    throw new Error('This vault has no recovery key. Set a recovery password first.');
  }

  // Verify the password before writing a backup that would be unreadable.
  await Vault.recoverKey(header, recoveryPassword);

  const json = JSON.stringify(header, null, 0);
  const date = new Date().toISOString().slice(0, 10);
  return { json, fileName: `cardly-backup-${date}.${BACKUP_FILE_EXTENSION}` };
}

/**
 * Parse and validate a backup file. Returns the vault header if it parses and
 * has the expected shape. Does not decrypt anything.
 */
export function parseBackup(text: string): VaultHeader {
  let header: unknown;
  try {
    header = JSON.parse(text);
  } catch {
    throw new Error('This is not a valid Cardly backup file.');
  }
  if (!isVaultHeader(header)) {
    throw new Error('This is not a valid Cardly backup file.');
  }
  return header;
}

/**
 * Restore a vault from backup text using the user's recovery password.
 *
 * Throws if the password is wrong or the file is corrupted (GCM
 * authentication fails).
 */
export async function restoreBackup(text: string, recoveryPassword: string): Promise<Vault> {
  const header = parseBackup(text);
  const vault = await Vault.openWithRecoveryPassword(header, recoveryPassword);
  // Force a decrypt now so a wrong password fails immediately with a clear
  // error, rather than on first card access.
  await vault.cardCount();
  return vault;
}

/**
 * Add a recovery key to a vault that does not have one yet (or replace the
 * existing one) and persist it.
 */
export async function setRecoveryKey(
  vault: Vault,
  password: string,
  persist: (header: VaultHeader) => Promise<void>,
  iterations: number = DEFAULT_PBKDF2_ITERATIONS,
): Promise<void> {
  const key = await Vault.recoverKeyFromVault(vault);
  const { wrapped, config } = await Crypto.wrapVaultKey(key, password, iterations);
  const header = vault.serialize();
  header.recovery = config;
  header.wrappedKey = wrapped;
  await persist(header);
  vault.adoptHeader(header);
}

export { DEFAULT_PBKDF2_ITERATIONS };

function isVaultHeader(value: unknown): value is VaultHeader {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.version === 'number' &&
    typeof v.payload === 'string' &&
    typeof v.kdf === 'object' &&
    v.kdf !== null &&
    typeof (v.kdf as Record<string, unknown>).algorithm === 'string' &&
    typeof (v.kdf as Record<string, unknown>).iterations === 'number'
  );
}

// RawKey re-export for type convenience.
export type { RawKey };
