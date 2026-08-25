/**
 * PBKDF2-HMAC-SHA256 (pure TypeScript) — **test environment only**.
 *
 * The production app uses `expo-crypto`'s native PBKDF2. This implementation
 * exists so key derivation is testable in Node and so the backup format can
 * be verified end-to-end without a device.
 */
import { bytesToHex, hexToBytes } from './encoding';
import { sha256 } from './sha256.test-helper';

export interface Pbkdf2Params {
  password: string;
  salt: Uint8Array;
  iterations: number;
  keyLength: number;
}

function hmacSha256(key: Uint8Array, message: Uint8Array): Uint8Array {
  const blockSize = 64;
  let k = key;
  if (k.length > blockSize) k = sha256(k);
  const ipad = new Uint8Array(blockSize);
  const opad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    ipad[i] = (i < k.length ? k[i] : 0) ^ 0x36;
    opad[i] = (i < k.length ? k[i] : 0) ^ 0x5c;
  }
  const inner = new Uint8Array(blockSize + message.length);
  inner.set(ipad);
  inner.set(message, blockSize);
  const innerHash = sha256(inner);
  const outer = new Uint8Array(blockSize + innerHash.length);
  outer.set(opad);
  outer.set(innerHash, blockSize);
  return sha256(outer);
}

export function pbkdf2Sha256(params: Pbkdf2Params): Uint8Array {
  const { password, salt, iterations, keyLength } = params;
  const passwordBytes = new TextEncoder().encode(password);
  const hLen = 32;
  const numBlocks = Math.ceil(keyLength / hLen);
  const out = new Uint8Array(numBlocks * hLen);

  for (let block = 1; block <= numBlocks; block++) {
    const blockIndex = new Uint8Array(4);
    blockIndex[0] = (block >>> 24) & 0xff;
    blockIndex[1] = (block >>> 16) & 0xff;
    blockIndex[2] = (block >>> 8) & 0xff;
    blockIndex[3] = block & 0xff;

    const u = new Uint8Array(salt.length + 4);
    u.set(salt);
    u.set(blockIndex, salt.length);

    let t = hmacSha256(passwordBytes, u);
    const tCopy = t.slice();
    for (let i = 1; i < iterations; i++) {
      t = hmacSha256(passwordBytes, t);
      for (let j = 0; j < hLen; j++) tCopy[j] ^= t[j];
    }
    out.set(tCopy, (block - 1) * hLen);
  }

  return out.slice(0, keyLength);
}

export function deriveKeyPure(params: Pbkdf2Params): Uint8Array {
  return pbkdf2Sha256(params);
}

// --- sanity check with a well-known RFC 7914 / NIST test vector -----------

const KNOWN_VECTORS: { password: string; salt: string; iterations: number; keyLength: number; expected: string }[] = [
  {
    password: 'password',
    salt: 'salt',
    iterations: 1,
    keyLength: 32,
    expected: '120fb6cffcf8b32c43e7225256c4f837a86548c92ccc35480805987cb70be17b',
  },
  {
    password: 'password',
    salt: 'salt',
    iterations: 2,
    keyLength: 32,
    expected: 'ae4d0c95af6b46d32d0adff928f06dd02a303f8ef3c251dfd6e2d85a95474c43',
  },
  {
    password: 'password',
    salt: 'salt',
    iterations: 4096,
    keyLength: 32,
    expected: 'c5e478d59288c841aa530db6845c4c8d962893a001ce4e11a4963873aa98134a',
  },
];

export function sanityCheckPbkdf2(): void {
  for (const v of KNOWN_VECTORS) {
    const derived = pbkdf2Sha256({
      password: v.password,
      salt: new TextEncoder().encode(v.salt),
      iterations: v.iterations,
      keyLength: v.keyLength,
    });
    if (bytesToHex(derived) !== v.expected) {
      throw new Error(`PBKDF2 sanity check failed for vector ${v.iterations}`);
    }
  }
  void hexToBytes;
}
