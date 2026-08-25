import { describe, expect, it } from 'vitest';

import { wrapVaultKey, unwrapVaultKey, createVaultKey } from '../src/keys';
import { bytesToHex, hexToBytes } from '../src/encoding';

describe('vault key wrapping', () => {
  it('wraps and unwraps with the same password', async () => {
    const key = await createVaultKey();
    const { wrapped, config } = await wrapVaultKey(key, 'correct horse battery staple', 1000);
    const recovered = await unwrapVaultKey(wrapped, 'correct horse battery staple', config);
    expect(bytesToHex(recovered)).toBe(bytesToHex(key));
  });

  it('fails with the wrong password', async () => {
    const key = await createVaultKey();
    const { wrapped, config } = await wrapVaultKey(key, 'right password', 1000);
    await expect(unwrapVaultKey(wrapped, 'wrong password', config)).rejects.toThrow();
  });

  it('uses a unique salt per wrap', async () => {
    const key = await createVaultKey();
    const a = await wrapVaultKey(key, 'pw', 1000);
    const b = await wrapVaultKey(key, 'pw', 1000);
    expect(a.config.salt).not.toBe(b.config.salt);
    expect(a.wrapped).not.toBe(b.wrapped);
  });

  it('produces a 32-byte key', async () => {
    const key = await createVaultKey();
    expect(key.length).toBe(32);
    expect(hexToBytes(bytesToHex(key)).length).toBe(32);
  });
});
