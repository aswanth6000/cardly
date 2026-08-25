import { describe, expect, it } from 'vitest';

import { createBackup, parseBackup, restoreBackup, setRecoveryKey } from '../src/index';
import { Vault } from '@cardly/vault';

const TEST_ITERATIONS = 1_000;

describe('encrypted backup', () => {
  it('creates a backup with no plaintext card data', async () => {
    const vault = await Vault.create('backup-pw', { pbkdf2Iterations: TEST_ITERATIONS });
    await vault.addCard({
      nickname: 'Travel',
      cardNumber: '4528123456784821',
      cardholderName: 'ASWANTH A',
      expiryMonth: 8,
      expiryYear: 2029,
      cvv: '123',
    });
    const { json, fileName } = await createBackup(vault, 'backup-pw');
    expect(fileName).toMatch(/^cardly-backup-\d{4}-\d{2}-\d{2}\.cardly$/);
    expect(json).not.toContain('4528123456784821');
    expect(json).not.toContain('ASWANTH');
    expect(json).not.toContain('"cvv":"123"');
  });

  it('restores a backup on a fresh vault with the recovery password', async () => {
    const source = await Vault.create('backup-pw', { pbkdf2Iterations: TEST_ITERATIONS });
    await source.addCard({
      nickname: 'Office',
      cardNumber: '5555555555554444',
      expiryMonth: 1,
      expiryYear: 2030,
    });
    const { json } = await createBackup(source, 'backup-pw');

    const restored = await restoreBackup(json, 'backup-pw');
    const cards = await restored.listCards();
    expect(cards).toHaveLength(1);
    expect(cards[0].last4).toBe('4444');
    const card = await restored.getCard(cards[0].id);
    expect(card?.cardNumber).toBe('5555 5555 5555 4444');
  });

  it('rejects a wrong recovery password', async () => {
    const vault = await Vault.create('right-pw', { pbkdf2Iterations: TEST_ITERATIONS });
    await vault.addCard({ nickname: 'X', cardNumber: '6011111111111117', expiryMonth: 12, expiryYear: 2031 });
    const { json } = await createBackup(vault, 'right-pw');
    await expect(restoreBackup(json, 'wrong-pw')).rejects.toThrow();
  });

  it('rejects a tampered backup', async () => {
    const vault = await Vault.create('pw', { pbkdf2Iterations: TEST_ITERATIONS });
    await vault.addCard({ nickname: 'Y', cardNumber: '378282246310005', expiryMonth: 2, expiryYear: 2032 });
    const { json } = await createBackup(vault, 'pw');
    const parsed = parseBackup(json);
    const bytes = Uint8Array.from(atob(parsed.payload), (c) => c.charCodeAt(0));
    bytes[0] ^= 0xff;
    parsed.payload = btoa(String.fromCharCode(...bytes));
    await expect(restoreBackup(JSON.stringify(parsed), 'pw')).rejects.toThrow();
  });

  it('rejects garbage input', async () => {
    expect(() => parseBackup('not json at all')).toThrow();
    expect(() => parseBackup(JSON.stringify({ foo: 1 }))).toThrow();
  });

  it('setRecoveryKey adds a recovery key to a vault that lacks one', async () => {
    const vault = await Vault.create();
    await vault.addCard({ nickname: 'Z', cardNumber: '4528123456784821', expiryMonth: 5, expiryYear: 2029 });
    let persisted: unknown = null;
    await setRecoveryKey(vault, 'new-pw', async (header) => {
      persisted = header;
    }, TEST_ITERATIONS);

    expect(persisted).not.toBeNull();
    const header = vault.serialize();
    expect(header.recovery).toBeDefined();
    expect(header.wrappedKey).toBeDefined();

    // Now a backup can be created and restored with the new password.
    const { json } = await createBackup(vault, 'new-pw');
    const restored = await restoreBackup(json, 'new-pw');
    expect(await restored.cardCount()).toBe(1);
  });
});
