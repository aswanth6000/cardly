/**
 * Vault access from the UI.
 *
 * The vault is created lazily on first use and kept in memory for the
 * session. The encrypted blob is re-read from disk on every mutation, so a
 * change in one screen is immediately visible in another.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { Vault, validateCardInput } from '@cardly/vault';
import type { Card, CardInput, CardSummary, VaultHeader } from '@cardly/vault';
import { createBackup, restoreBackup, setRecoveryKey } from '@cardly/backup';
import type { BackupResult } from '@cardly/backup';

import { createKeyValueStore } from '@cardly/storage';
import type { KeyValueStore } from '@cardly/storage';

export const VAULT_STORAGE_KEY = 'cardly.vault';

export interface VaultContextValue {
  ready: boolean;
  locked: boolean;
  summary: CardSummary[] | null;
  vault: Vault | null;
  hasRecoveryKey: boolean;
  unlock: () => Promise<void>;
  lock: () => Promise<void>;
  createNewVault: () => Promise<void>;
  deleteVault: () => Promise<void>;
  getCard: (id: string) => Promise<Card | null>;
  addCard: (input: CardInput) => Promise<Card>;
  updateCard: (id: string, input: CardInput) => Promise<Card | null>;
  deleteCard: (id: string) => Promise<boolean>;
  validateInput: (input: CardInput) => ReturnType<typeof validateCardInput>;
  setRecoveryPassword: (password: string) => Promise<void>;
  exportBackup: (password: string) => Promise<BackupResult>;
  importBackup: (text: string, password: string) => Promise<void>;
}

const VaultContext = createContext<VaultContextValue | null>(null);

export function VaultProvider({ children, store }: { children: React.ReactNode; store?: KeyValueStore }) {
  const storage = useMemo(() => store ?? createKeyValueStore(), [store]);
  const [ready, setReady] = useState(false);
  const [locked, setLocked] = useState(true);
  const [summary, setSummary] = useState<CardSummary[] | null>(null);
  const [vault, setVault] = useState<Vault | null>(null);
  const vaultRef = useRef<Vault | null>(null);

  const refreshSummary = useCallback(async (v: Vault | null) => {
    if (!v) {
      setSummary(null);
      return;
    }
    setSummary(await v.listCards());
  }, []);

  const loadVault = useCallback(async (): Promise<Vault | null> => {
    const raw = await storage.getItem(VAULT_STORAGE_KEY);
    if (!raw) return null;
    const header = JSON.parse(raw) as Parameters<typeof Vault.open>[0];
    const key = await readStoredKey(storage);
    if (!key) return null;
    return Vault.open(header, key);
  }, [storage]);

  useEffect(() => {
    (async () => {
      const v = await loadVault();
      vaultRef.current = v;
      if (v) {
        setVault(v);
        await refreshSummary(v);
      }
      setReady(true);
    })();
  }, [loadVault, refreshSummary]);

  const unlock = useCallback(async () => {
    if (vaultRef.current) {
      setLocked(false);
      return;
    }
    const v = await loadVault();
    if (!v) {
      setLocked(false);
      return;
    }
    vaultRef.current = v;
    setVault(v);
    await refreshSummary(v);
    setLocked(false);
  }, [loadVault, refreshSummary]);

  const lock = useCallback(async () => {
    setLocked(true);
    setSummary(null);
  }, []);

  const createNewVault = useCallback(async () => {
    const v = await Vault.create();
    await storage.setItem(VAULT_STORAGE_KEY, JSON.stringify(v.serialize()));
    vaultRef.current = v;
    setVault(v);
    await refreshSummary(v);
    setLocked(false);
  }, [storage, refreshSummary]);

  const deleteVault = useCallback(async () => {
    await storage.deleteItem(VAULT_STORAGE_KEY);
    await storage.deleteItem(VAULT_KEY_STORAGE_KEY);
    vaultRef.current = null;
    setVault(null);
    setSummary(null);
    setLocked(true);
  }, [storage]);

  const getCard = useCallback(
    async (id: string) => {
      const v = vaultRef.current;
      if (!v) return null;
      return v.getCard(id);
    },
    [],
  );

  const persist = useCallback(
    async (v: Vault) => {
      await storage.setItem(VAULT_STORAGE_KEY, JSON.stringify(v.serialize()));
      await refreshSummary(v);
    },
    [storage, refreshSummary],
  );

  const ensureVault = useCallback(async (): Promise<Vault> => {
    let v = vaultRef.current;
    if (!v) {
      v = await Vault.create();
      await storage.setItem(VAULT_STORAGE_KEY, JSON.stringify(v.serialize()));
      await storeVaultKey(await Vault.recoverKeyFromVault(v), storage);
      vaultRef.current = v;
      setVault(v);
    }
    return v;
  }, [storage]);

  const addCard = useCallback(
    async (input: CardInput) => {
      const v = await ensureVault();
      const card = await v.addCard(input);
      await persist(v);
      return card;
    },
    [ensureVault, persist],
  );

  const updateCard = useCallback(
    async (id: string, input: CardInput) => {
      const v = vaultRef.current;
      if (!v) return null;
      const card = await v.updateCard(id, input);
      if (card) await persist(v);
      return card;
    },
    [persist],
  );

  const deleteCard = useCallback(
    async (id: string) => {
      const v = vaultRef.current;
      if (!v) return false;
      const ok = await v.deleteCard(id);
      if (ok) await persist(v);
      return ok;
    },
    [persist],
  );

  const hasRecoveryKey = useMemo(() => {
    const header = vault?.serialize();
    return Boolean(header?.recovery && header?.wrappedKey);
  }, [vault]);

  const setRecoveryPassword = useCallback(
    async (password: string) => {
      const v = vaultRef.current;
      if (!v) throw new Error('Vault is not available');
      await setRecoveryKey(v, password, async (header: VaultHeader) => {
        await storage.setItem(VAULT_STORAGE_KEY, JSON.stringify(header));
      });
    },
    [storage],
  );

  const exportBackup = useCallback(
    async (password: string) => {
      const v = vaultRef.current;
      if (!v) throw new Error('Vault is not available');
      return createBackup(v, password);
    },
    [],
  );

  const importBackup = useCallback(
    async (text: string, password: string) => {
      const restored = await restoreBackup(text, password);
      await storage.setItem(VAULT_STORAGE_KEY, JSON.stringify(restored.serialize()));
      await storage.deleteItem(VAULT_KEY_STORAGE_KEY);
      const key = await Vault.recoverKeyFromVault(restored);
      await storeVaultKey(key, storage);
      vaultRef.current = restored;
      setVault(restored);
      await refreshSummary(restored);
      setLocked(false);
    },
    [storage, refreshSummary],
  );

  const value = useMemo<VaultContextValue>(
    () => ({
      ready,
      locked,
      summary,
      vault,
      hasRecoveryKey,
      unlock,
      lock,
      createNewVault,
      deleteVault,
      getCard,
      addCard,
      updateCard,
      deleteCard,
      validateInput: validateCardInput,
      setRecoveryPassword,
      exportBackup,
      importBackup,
    }),
    [ready, locked, summary, vault, hasRecoveryKey, unlock, lock, createNewVault, deleteVault, getCard, addCard, updateCard, deleteCard, setRecoveryPassword, exportBackup, importBackup],
  );

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVault(): VaultContextValue {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error('useVault must be used within a VaultProvider');
  return ctx;
}

export const VAULT_KEY_STORAGE_KEY = 'cardly.vault-key';

export async function readStoredKey(storage: KeyValueStore): Promise<Uint8Array | null> {
  const hex = await storage.getItem(VAULT_KEY_STORAGE_KEY);
  if (!hex) return null;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

export async function storeVaultKey(key: Uint8Array, storage: KeyValueStore): Promise<void> {
  let hex = '';
  for (const b of key) hex += b.toString(16).padStart(2, '0');
  await storage.setItem(VAULT_KEY_STORAGE_KEY, hex);
}
