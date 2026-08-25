import { describe, expect, it } from 'vitest';

import { Vault } from '../src/vault';
import { decryptString, encryptString } from '@cardly/crypto';

const TEST_ITERATIONS = 1_000;

/**
 * Backup-format behavior:
 *
 * A backup is the serialized vault header (a JSON object with a `payload`
 * field containing `base64(nonce|ciphertext|tag)` plus optional recovery
 * wrapping). This test verifies the exact contract documented in
 * `docs/backup-format.md`:
 *   - the backup contains no plaintext card data
 *   - it can be restored on a different device using only the recovery
 *     password (the recovery config travels inside the file)
 *   - a tampered backup is rejected
 */
describe('backup / restore contract', () => {
  it('produces a backup file that restores on a fresh vault', async () => {
    const source = await Vault.create('backup-password', { pbkdf2Iterations: TEST_ITERATIONS });
    await source.addCard({
      nickname: 'Travel',
      issuer: 'HDFC',
      cardNumber: '4528123456784821',
      cardholderName: 'ASWANTH A',
      expiryMonth: 8,
      expiryYear: 2029,
      cvv: '123',
    });
    const backup = JSON.stringify(source.serialize());

    // 1. No plaintext card data anywhere in the backup file.
    expect(backup).not.toContain('4528123456784821');
    expect(backup).not.toContain('ASWANTH');
    expect(backup).not.toContain('123');

    // 2. Restore on a fresh device: parse the file and open with the password.
    const header = JSON.parse(backup) as Parameters<typeof Vault.open>[0];
    const restored = await Vault.openWithRecoveryPassword(header, 'backup-password');
    const cards = await restored.listCards();
    expect(cards).toHaveLength(1);
    expect(cards[0].last4).toBe('4821');
    const card = await restored.getCard(cards[0].id);
    expect(card?.cardNumber).toBe('4528 1234 5678 4821');
  });

  it('rejects a tampered backup', async () => {
    const source = await Vault.create('backup-password', { pbkdf2Iterations: TEST_ITERATIONS });
    await source.addCard({ nickname: 'X', cardNumber: '5555555555554444', expiryMonth: 1, expiryYear: 2030 });
    const header = source.serialize();
    const bytes = Uint8Array.from(atob(header.payload), (c) => c.charCodeAt(0));
    bytes[0] ^= 0xff;
    header.payload = btoa(String.fromCharCode(...bytes));
    await expect(Vault.openWithRecoveryPassword(header, 'backup-password')).rejects.toThrow();
  });

  it('is an AES-GCM sealed payload that can be decrypted directly', async () => {
    const source = await Vault.create('backup-password', { pbkdf2Iterations: TEST_ITERATIONS });
    await source.addCard({ nickname: 'Y', cardNumber: '6011111111111117', expiryMonth: 12, expiryYear: 2031 });
    const header = source.serialize();
    const key = await Vault.recoverKey(header, 'backup-password');
    const payload = await decryptString(header.payload, key);
    const parsed = JSON.parse(payload) as { schemaVersion: number; cards: unknown[] };
    expect(parsed.schemaVersion).toBe(1);
    expect(parsed.cards).toHaveLength(1);
    // Sanity: the same string must re-encrypt to a valid sealed blob.
    await expect(encryptString(payload, key)).resolves.toBeTruthy();
  });
});
