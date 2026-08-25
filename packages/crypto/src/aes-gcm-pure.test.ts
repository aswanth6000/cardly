import { describe, expect, it } from 'vitest';

import { encrypt, decrypt } from '../src/aes-gcm-pure';
import { bytesToHex, hexToBytes } from '../src/encoding';

describe('AES-256-GCM (pure implementation)', () => {
  it('round-trips a message', () => {
    const key = hexToBytes('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f');
    const nonce = hexToBytes('000102030405060708090a0b');
    const plaintext = new TextEncoder().encode('Cardly vault payload');
    const sealed = encrypt(key, nonce, plaintext);
    const out = decrypt(key, sealed);
    expect(bytesToHex(out)).toBe(bytesToHex(plaintext));
  });

  it('produces deterministic output for a fixed nonce', () => {
    const key = hexToBytes('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f');
    const nonce = hexToBytes('000102030405060708090a0b');
    const plaintext = new TextEncoder().encode('deterministic');
    const a = encrypt(key, nonce, plaintext);
    const b = encrypt(key, nonce, plaintext);
    expect(bytesToHex(a)).toBe(bytesToHex(b));
  });

  it('fails authentication with a wrong key', () => {
    const key = hexToBytes('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f');
    const wrong = hexToBytes('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
    const nonce = hexToBytes('000102030405060708090a0b');
    const sealed = encrypt(key, nonce, new TextEncoder().encode('secret'));
    expect(() => decrypt(wrong, sealed)).toThrow();
  });

  it('fails authentication when ciphertext is tampered', () => {
    const key = hexToBytes('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f');
    const nonce = hexToBytes('000102030405060708090a0b');
    const sealed = encrypt(key, nonce, new TextEncoder().encode('secret'));
    sealed[sealed.length - 1] ^= 0x01; // flip a tag bit
    expect(() => decrypt(key, sealed)).toThrow();
  });

  it('fails authentication when nonce is tampered', () => {
    const key = hexToBytes('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f');
    const nonce = hexToBytes('000102030405060708090a0b');
    const sealed = encrypt(key, nonce, new TextEncoder().encode('secret'));
    sealed[0] ^= 0x01;
    expect(() => decrypt(key, sealed)).toThrow();
  });
});
