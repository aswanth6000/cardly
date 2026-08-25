import { describe, expect, it } from 'vitest';

import { deriveKeyPure, pbkdf2Sha256 } from '../src/pbkdf2-pure';
import { bytesToHex } from '../src/encoding';

describe('PBKDF2-HMAC-SHA256 (pure implementation)', () => {
  it('matches RFC 6070 test vectors', () => {
    const cases: [string, string, number, number, string][] = [
      ['password', 'salt', 1, 32, '120fb6cffcf8b32c43e7225256c4f837a86548c92ccc35480805987cb70be17b'],
      ['password', 'salt', 2, 32, 'ae4d0c95af6b46d32d0adff928f06dd02a303f8ef3c251dfd6e2d85a95474c43'],
      ['password', 'salt', 4096, 32, 'c5e478d59288c841aa530db6845c4c8d962893a001ce4e11a4963873aa98134a'],
    ];
    for (const [password, salt, iterations, keyLength, expected] of cases) {
      const derived = pbkdf2Sha256({
        password,
        salt: new TextEncoder().encode(salt),
        iterations,
        keyLength,
      });
      expect(bytesToHex(derived)).toBe(expected);
    }
  });

  it('produces different keys for different passwords', () => {
    const a = deriveKeyPure({ password: 'one', salt: new TextEncoder().encode('s'), iterations: 10, keyLength: 32 });
    const b = deriveKeyPure({ password: 'two', salt: new TextEncoder().encode('s'), iterations: 10, keyLength: 32 });
    expect(bytesToHex(a)).not.toBe(bytesToHex(b));
  });

  it('produces different keys for different salts', () => {
    const a = deriveKeyPure({ password: 'p', salt: new TextEncoder().encode('s1'), iterations: 10, keyLength: 32 });
    const b = deriveKeyPure({ password: 'p', salt: new TextEncoder().encode('s2'), iterations: 10, keyLength: 32 });
    expect(bytesToHex(a)).not.toBe(bytesToHex(b));
  });
});
