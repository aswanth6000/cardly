import { describe, expect, it } from 'vitest';

import { encryptString, decryptString, encryptStringToHex, decryptStringFromHex } from '../src/aes-gcm';
import { getDeterministicHex } from '../src/platform.node';

describe('AES-GCM string envelope', () => {
  it('round-trips via base64', async () => {
    const key = new Uint8Array(32);
    for (let i = 0; i < 32; i++) key[i] = i;
    const ct = await encryptString('card number 4528123456784821', key);
    expect(ct).not.toContain('4528123456784821');
    const pt = await decryptString(ct, key);
    expect(pt).toBe('card number 4528123456784821');
  });

  it('round-trips via hex', async () => {
    const key = new Uint8Array(32);
    for (let i = 0; i < 32; i++) key[i] = i;
    const ct = await encryptStringToHex('hello vault', key);
    expect(ct).toMatch(/^[0-9a-f]+$/);
    const pt = await decryptStringFromHex(ct, key);
    expect(pt).toBe('hello vault');
  });

  it('produces unique ciphertext for the same plaintext (random nonce)', async () => {
    const key = new Uint8Array(32);
    for (let i = 0; i < 32; i++) key[i] = i;
    const a = await encryptString('same plaintext', key);
    const b = await encryptString('same plaintext', key);
    expect(a).not.toBe(b);
  });

  it('fails to decrypt with the wrong key', async () => {
    const key = new Uint8Array(32);
    const wrong = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      key[i] = i;
      wrong[i] = 255 - i;
    }
    const ct = await encryptString('top secret', key);
    await expect(decryptString(ct, wrong)).rejects.toThrow();
  });

  it('rejects corrupted sealed data', async () => {
    const key = new Uint8Array(32);
    const ct = await encryptString('corrupt me', key);
    const bytes = Uint8Array.from(atob(ct), (c) => c.charCodeAt(0));
    bytes[10] ^= 0xff;
    const corrupted = btoa(String.fromCharCode(...bytes));
    await expect(decryptString(corrupted, key)).rejects.toThrow();
  });

  it('works with a hex-derived deterministic key', async () => {
    const key = new Uint8Array(32);
    const hex = getDeterministicHex(32);
    for (let i = 0; i < 32; i++) key[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    const ct = await encryptString('deterministic', key);
    expect(await decryptString(ct, key)).toBe('deterministic');
  });
});
