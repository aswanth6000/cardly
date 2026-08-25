import { describe, expect, it } from 'vitest';

import { Vault } from '../src/vault';

const TEST_ITERATIONS = 1_000;

function sampleCard(overrides: Record<string, unknown> = {}) {
  return {
    nickname: 'Travel Card',
    issuer: 'HDFC',
    cardNumber: '4528123456784821',
    cardholderName: 'ASWANTH A',
    expiryMonth: 8,
    expiryYear: 2029,
    cvv: '123',
    ...overrides,
  };
}

describe('Vault', () => {
  it('creates an empty vault with an encrypted payload', async () => {
    const vault = await Vault.create();
    expect(vault.serialize().version).toBe(1);
    expect(vault.serialize().payload).toMatch(/^[A-Za-z0-9+/=]+$/);
    await expect(vault.cardCount()).resolves.toBe(0);
  });

  it('adds a card and lists summaries', async () => {
    const vault = await Vault.create();
    await vault.addCard(sampleCard());
    await vault.addCard(sampleCard({ nickname: 'Office Card', cardNumber: '5555555555554444' }));
    const summaries = await vault.listCards();
    expect(summaries).toHaveLength(2);
    expect(summaries.map((s) => s.last4).sort()).toEqual(['4444', '4821']);
    // summaries are sorted by nickname
    expect(summaries[0].nickname).toBe('Office Card');
  });

  it('encrypts the payload so plaintext card data is not in the serialized vault', async () => {
    const vault = await Vault.create();
    await vault.addCard(sampleCard());
    const serialized = JSON.stringify(vault.serialize());
    expect(serialized).not.toContain('4528123456784821');
    expect(serialized).not.toContain('ASWANTH');
    expect(serialized).not.toContain('123');
  });

  it('round-trips through serialize/open via recovery password', async () => {
    const vault = await Vault.create('test-password', { pbkdf2Iterations: TEST_ITERATIONS });
    await vault.addCard(sampleCard());
    const header = vault.serialize();
    const reopened = await Vault.openWithRecoveryPassword(header, 'test-password');
    expect(await reopened.cardCount()).toBe(1);
    const card = await reopened.getCard((await reopened.listCards())[0].id);
    expect(card?.cardNumber).toBe('4528 1234 5678 4821');
  });

  it('updates a card', async () => {
    const vault = await Vault.create();
    const card = await vault.addCard(sampleCard());
    const updated = await vault.updateCard(card.id, { ...sampleCard(), nickname: 'Renamed' });
    expect(updated?.nickname).toBe('Renamed');
    const fetched = await vault.getCard(card.id);
    expect(fetched?.nickname).toBe('Renamed');
  });

  it('deletes a card', async () => {
    const vault = await Vault.create();
    const card = await vault.addCard(sampleCard());
    await vault.addCard(sampleCard({ nickname: 'Second' }));
    expect(await vault.deleteCard(card.id)).toBe(true);
    expect(await vault.cardCount()).toBe(1);
    expect(await vault.deleteCard('missing')).toBe(false);
  });

  it('stores the recovery-wrapped key for password restore', async () => {
    const vault = await Vault.create('recovery-password', { pbkdf2Iterations: TEST_ITERATIONS });
    const header = vault.serialize();
    expect(header.recovery).toBeDefined();
    expect(header.wrappedKey).toBeDefined();

    const restored = await Vault.openWithRecoveryPassword(header, 'recovery-password');
    await restored.addCard(sampleCard());
    const restoredHeader = restored.serialize();
    expect(restoredHeader.payload).not.toContain('4528123456784821');

    // Wrong password must fail
    await expect(Vault.openWithRecoveryPassword(header, 'wrong')).rejects.toThrow();
  });

  it('rejects a corrupted payload', async () => {
    const vault = await Vault.create('test-password', { pbkdf2Iterations: TEST_ITERATIONS });
    await vault.addCard(sampleCard());
    const key = await Vault.recoverKey(vault.serialize(), 'test-password');
    const header = vault.serialize();
    const bytes = Uint8Array.from(atob(header.payload), (c) => c.charCodeAt(0));
    bytes[5] ^= 0xff;
    header.payload = btoa(String.fromCharCode(...bytes));
    await expect(Vault.open(header, key)).rejects.toThrow();
  });
});
