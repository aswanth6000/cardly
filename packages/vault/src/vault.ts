/**
 * The encrypted local vault.
 *
 * A vault is a JSON document containing the user's cards, encrypted with
 * AES-256-GCM using the vault key and stored as a single ciphertext blob
 * (nonce | ciphertext | tag, base64) plus a plaintext header of
 * non-sensitive metadata.
 *
 * ```text
 * vault = {
 *   version: 1,
 *   kdf: { algorithm: "PBKDF2-HMAC-SHA256", iterations },
 *   recovery: { salt, iterations },      // optional — enables export/restore
 *   wrappedKey: "...",                   // optional — vaultKey sealed by recovery key
 *   payload: "base64(nonce|ct|tag)"      // encrypted { cards: Card[], schemaVersion }
 * }
 * ```
 *
 * Only the `payload` contains card data. The header intentionally holds no
 * sensitive values (no card numbers, no names, no counts).
 */
import * as Crypto from '@cardly/crypto';
import type { RawKey } from '@cardly/crypto';

import { toSummary } from './card';
import type { Card, CardSummary } from './card';
import { formatCardNumber, normalizeCardNumber } from './validation';
import type { CardInput, ValidationResult } from './validation';

export const VAULT_VERSION = 1;
export const PAYLOAD_SCHEMA_VERSION = 1;
export const DEFAULT_PBKDF2_ITERATIONS = 600_000;

export interface RecoveryConfig {
  salt: string;
  iterations: number;
}

export interface VaultHeader {
  version: number;
  kdf: { algorithm: 'PBKDF2-HMAC-SHA256'; iterations: number };
  recovery?: RecoveryConfig;
  wrappedKey?: string;
  payload: string;
}

export interface VaultPayload {
  schemaVersion: number;
  cards: Card[];
}

export interface VaultContents {
  header: VaultHeader;
  cards: Card[];
}

export class Vault {
  readonly header: VaultHeader;
  private readonly key: RawKey;

  private constructor(header: VaultHeader, key: RawKey) {
    this.header = header;
    this.key = key;
  }

  static async create(recoveryPassword?: string, options?: { pbkdf2Iterations?: number }): Promise<Vault> {
    const iterations = options?.pbkdf2Iterations ?? DEFAULT_PBKDF2_ITERATIONS;
    const key = await Crypto.createVaultKey();
    const header: VaultHeader = {
      version: VAULT_VERSION,
      kdf: { algorithm: 'PBKDF2-HMAC-SHA256', iterations },
      payload: '',
    };
    if (recoveryPassword) {
      const { wrapped, config } = await Crypto.wrapVaultKey(key, recoveryPassword, iterations);
      header.recovery = config;
      header.wrappedKey = wrapped;
    }
    const vault = new Vault(header, key);
    vault.header.payload = await vault.encryptPayload({ schemaVersion: PAYLOAD_SCHEMA_VERSION, cards: [] });
    return vault;
  }

  static async open(header: VaultHeader, key: RawKey): Promise<Vault> {
    const vault = new Vault(header, key);
    await vault.decryptPayload();
    return vault;
  }

  static async openWithRecoveryPassword(header: VaultHeader, password: string): Promise<Vault> {
    if (!header.recovery || !header.wrappedKey) {
      throw new Error('This vault has no recovery key');
    }
    const key = await Crypto.unwrapVaultKey(header.wrappedKey, password, header.recovery);
    return Vault.open(header, key);
  }

  static async recoverKey(header: VaultHeader, password: string): Promise<RawKey> {
    if (!header.recovery || !header.wrappedKey) {
      throw new Error('This vault has no recovery key');
    }
    return Crypto.unwrapVaultKey(header.wrappedKey, password, header.recovery);
  }

  /** The in-memory key for this vault instance. Used to add/replace the
   *  recovery wrapping. */
  static async recoverKeyFromVault(vault: Vault): Promise<RawKey> {
    return vault.key;
  }

  /** Replace the header of this in-memory vault (after a recovery-key
   *  change) without touching the encrypted payload. */
  adoptHeader(header: VaultHeader): void {
    this.header.recovery = header.recovery;
    this.header.wrappedKey = header.wrappedKey;
    this.header.kdf = header.kdf;
    this.header.version = header.version;
    this.header.payload = header.payload;
  }

  async encryptPayload(payload: VaultPayload): Promise<string> {
    const json = JSON.stringify(payload);
    return Crypto.encryptString(json, this.key);
  }

  async decryptPayload(): Promise<VaultPayload> {
    const json = await Crypto.decryptString(this.header.payload, this.key);
    return JSON.parse(json) as VaultPayload;
  }

  async listCards(): Promise<CardSummary[]> {
    const payload = await this.decryptPayload();
    return payload.cards.map(toSummary).sort((a, b) => a.nickname.localeCompare(b.nickname));
  }

  async getCard(id: string): Promise<Card | null> {
    const payload = await this.decryptPayload();
    return payload.cards.find((c) => c.id === id) ?? null;
  }

  async addCard(input: CardInput): Promise<Card> {
    const payload = await this.decryptPayload();
    const normalized = normalizeCardInput(input);
    const now = new Date().toISOString();
    const card: Card = {
      ...normalized,
      id: Crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    payload.cards.push(card);
    this.header.payload = await this.encryptPayload(payload);
    return card;
  }

  async updateCard(id: string, input: CardInput): Promise<Card | null> {
    const payload = await this.decryptPayload();
    const idx = payload.cards.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const existing = payload.cards[idx];
    const updated: Card = {
      ...existing,
      ...normalizeCardInput(input),
      updatedAt: new Date().toISOString(),
    };
    payload.cards[idx] = updated;
    this.header.payload = await this.encryptPayload(payload);
    return updated;
  }

  async deleteCard(id: string): Promise<boolean> {
    const payload = await this.decryptPayload();
    const next = payload.cards.filter((c) => c.id !== id);
    if (next.length === payload.cards.length) return false;
    payload.cards = next;
    this.header.payload = await this.encryptPayload(payload);
    return true;
  }

  async hasCards(): Promise<boolean> {
    const payload = await this.decryptPayload();
    return payload.cards.length > 0;
  }

  async cardCount(): Promise<number> {
    const payload = await this.decryptPayload();
    return payload.cards.length;
  }

  serialize(): VaultHeader {
    return { ...this.header };
  }

  validate(): ValidationResult {
    // The vault-level validation of the stored payload happens implicitly via
    // decryptPayload + JSON.parse. Exposed for symmetry with card validation.
    return { valid: true, errors: [] };
  }
}

function normalizeCardInput(input: CardInput): Omit<Card, 'id' | 'createdAt' | 'updatedAt'> {
  const cardNumber = normalizeCardNumber(input.cardNumber);
  const cardholderName = input.cardholderName?.trim() || undefined;
  return {
    nickname: input.nickname.trim(),
    issuer: input.issuer?.trim() || undefined,
    cardNumber: formatCardNumber(cardNumber),
    cardholderName: cardholderName ? cardholderName.toUpperCase() : undefined,
    expiryMonth: input.expiryMonth,
    expiryYear: input.expiryYear,
    cvv: input.cvv?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
  };
}
