/**
 * Key-value storage backed by `expo-secure-store` (iOS Keychain / Android
 * Keystore).
 *
 * The storage layer stores only ciphertext and non-sensitive metadata. It
 * never logs values, and error messages never include stored content.
 */
import * as SecureStore from 'expo-secure-store';

export interface StorageOptions {
  requireAuthentication?: boolean;
  authenticationPrompt?: string;
}

export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string, options?: StorageOptions): Promise<void>;
  deleteItem(key: string): Promise<void>;
  contains(key: string): Promise<boolean>;
}

export class SecureKeyValueStore implements KeyValueStore {
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      throw new Error(`Unable to read storage entry "${key}"`);
    }
  }

  async setItem(key: string, value: string, options?: StorageOptions): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value, {
        requireAuthentication: options?.requireAuthentication,
        authenticationPrompt: options?.authenticationPrompt,
      });
    } catch {
      throw new Error(`Unable to write storage entry "${key}"`);
    }
  }

  async deleteItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      throw new Error(`Unable to delete storage entry "${key}"`);
    }
  }

  async contains(key: string): Promise<boolean> {
    return (await this.getItem(key)) !== null;
  }
}

export function createKeyValueStore(): KeyValueStore {
  return new SecureKeyValueStore();
}
