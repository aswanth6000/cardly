/**
 * Key-value storage.
 *
 * Native (iOS/Android): backed by `expo-secure-store` (Keychain / Keystore).
 * Web: backed by `localStorage` (SecureStore is native-only; the web build
 * is for preview/development and does not hold production secrets).
 *
 * The storage layer stores only ciphertext and non-sensitive metadata. It
 * never logs values, and error messages never include stored content.
 */
import { Platform } from 'react-native';

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

const PREFIX = 'cardly.';

class SecureKeyValueStore implements KeyValueStore {
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

class WebKeyValueStore implements KeyValueStore {
  private read(key: string): string | null {
    try {
      return globalThis.localStorage?.getItem(PREFIX + key) ?? null;
    } catch {
      return null;
    }
  }

  async getItem(key: string): Promise<string | null> {
    return this.read(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      globalThis.localStorage?.setItem(PREFIX + key, value);
    } catch {
      throw new Error(`Unable to write storage entry "${key}"`);
    }
  }

  async deleteItem(key: string): Promise<void> {
    try {
      globalThis.localStorage?.removeItem(PREFIX + key);
    } catch {
      throw new Error(`Unable to delete storage entry "${key}"`);
    }
  }

  async contains(key: string): Promise<boolean> {
    return this.read(key) !== null;
  }
}

export function createKeyValueStore(): KeyValueStore {
  return Platform.OS === 'web' ? new WebKeyValueStore() : new SecureKeyValueStore();
}
