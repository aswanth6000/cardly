/**
 * Authentication service.
 *
 * The vault encryption key is stored in SecureStore *without*
 * `requireAuthentication`, so the vault can be opened after a device restart
 * without user interaction. Unlock (showing sensitive values) is a separate
 * step that always goes through the device's biometric / passcode
 * authentication, which is enforced by the app-lock hook rather than by
 * keychain access control. This keeps the common path fast and reliable.
 *
 * No sensitive values ever appear in logs or error messages here.
 */
import { createKeyValueStore } from '@cardly/storage';
import type { KeyValueStore } from '@cardly/storage';
import { getRandomBytes } from '@cardly/crypto';

const KEY_LENGTH = 32;

export interface AuthService {
  storeVaultKey: (key: Uint8Array) => Promise<void>;
  readVaultKey: () => Promise<Uint8Array | null>;
  deleteVaultKey: () => Promise<void>;
  createVaultKey: () => Promise<Uint8Array>;
}

export function createAuthService(store: KeyValueStore = createKeyValueStore()): AuthService {
  const KEY = 'cardly.vault-key';
  return {
    async storeVaultKey(key: Uint8Array): Promise<void> {
      let hex = '';
      for (const b of key) hex += b.toString(16).padStart(2, '0');
      await store.setItem(KEY, hex);
    },
    async readVaultKey(): Promise<Uint8Array | null> {
      const hex = await store.getItem(KEY);
      if (!hex) return null;
      const bytes = new Uint8Array(hex.length / 2);
      for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
      return bytes;
    },
    async deleteVaultKey(): Promise<void> {
      await store.deleteItem(KEY);
    },
    async createVaultKey(): Promise<Uint8Array> {
      return getRandomBytes(KEY_LENGTH);
    },
  };
}
