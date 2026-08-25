/**
 * AES-256-GCM in pure TypeScript, used **only** in the test environment and
 * for cross-environment interoperability checks.
 *
 * The production app uses `expo-crypto`'s native AES-GCM. This file exists so
 * that vault/backup crypto behavior can be unit-tested without a device or
 * simulator. It is a small, auditable port of the AES-GCM construction
 * (NIST SP 800-38D) and is **not** used at runtime in the app.
 */

// --- AES-256 core ----------------------------------------------------------

const SBOX: number[] = new Array(256);

function xtime(a: number): number {
  return ((a << 1) ^ (a & 0x80 ? 0x1b : 0)) & 0xff;
}

(function buildSBox() {
  let p = 1;
  let q = 1;
  do {
    p = p ^ ((p << 1) & 0xff) ^ (p & 0x80 ? 0x1b : 0);
    q ^= (q << 1) & 0xff;
    q ^= (q << 2) & 0xff;
    q ^= (q << 4) & 0xff;
    q ^= q & 0x80 ? 0x09 : 0;
    const x = q ^ (q << 1) ^ (q << 2) ^ (q << 3) ^ (q << 4);
    const y = (x ^ (x >>> 8) ^ 0x63) & 0xff;
    SBOX[p] = y;
  } while (p !== 1);
  SBOX[0] = 0x63;
})();

function subBytes(state: Uint8Array): void {
  for (let i = 0; i < 16; i++) state[i] = SBOX[state[i]];
}

function shiftRows(state: Uint8Array): void {
  const t = state.slice();
  for (let r = 1; r < 4; r++) {
    for (let c = 0; c < 4; c++) state[r + 4 * c] = t[r + 4 * ((c + r) % 4)];
  }
}

function mixColumns(state: Uint8Array): void {
  for (let c = 0; c < 4; c++) {
    const i = 4 * c;
    const a0 = state[i];
    const a1 = state[i + 1];
    const a2 = state[i + 2];
    const a3 = state[i + 3];
    state[i] = xtime(a0) ^ (xtime(a1) ^ a1) ^ a2 ^ a3;
    state[i + 1] = a0 ^ xtime(a1) ^ (xtime(a2) ^ a2) ^ a3;
    state[i + 2] = a0 ^ a1 ^ xtime(a2) ^ (xtime(a3) ^ a3);
    state[i + 3] = (xtime(a0) ^ a0) ^ a1 ^ a2 ^ xtime(a3);
  }
}

function addRoundKey(state: Uint8Array, roundKey: Uint8Array): void {
  for (let i = 0; i < 16; i++) state[i] ^= roundKey[i];
}

function expandKey(key: Uint8Array): Uint8Array[] {
  const nk = key.length / 4;
  const nr = nk + 6;
  const words: number[] = [];
  for (let i = 0; i < nk; i++) {
    words.push((key[4 * i] << 24) | (key[4 * i + 1] << 16) | (key[4 * i + 2] << 8) | key[4 * i + 3]);
  }
  for (let i = nk; i < 4 * (nr + 1); i++) {
    let temp = words[i - 1];
    if (i % nk === 0) {
      temp = ((temp << 8) | (temp >>> 24)) >>> 0;
      const b0 = SBOX[(temp >>> 24) & 0xff];
      const b1 = SBOX[(temp >>> 16) & 0xff];
      const b2 = SBOX[(temp >>> 8) & 0xff];
      const b3 = SBOX[temp & 0xff];
      temp = ((b0 << 24) | (b1 << 16) | (b2 << 8) | b3) ^ (RCON[i / nk - 1] << 24);
    }
    words.push((words[i - nk] ^ temp) >>> 0);
  }
  const roundKeys: Uint8Array[] = [];
  for (let r = 0; r <= nr; r++) {
    const rk = new Uint8Array(16);
    for (let j = 0; j < 4; j++) {
      const w = words[4 * r + j];
      rk[4 * j] = (w >>> 24) & 0xff;
      rk[4 * j + 1] = (w >>> 16) & 0xff;
      rk[4 * j + 2] = (w >>> 8) & 0xff;
      rk[4 * j + 3] = w & 0xff;
    }
    roundKeys.push(rk);
  }
  return roundKeys;
}

const RCON: number[] = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];

function encryptBlock(block: Uint8Array, roundKeys: Uint8Array[]): Uint8Array {
  const state = block.slice();
  addRoundKey(state, roundKeys[0]);
  for (let r = 1; r < roundKeys.length - 1; r++) {
    subBytes(state);
    shiftRows(state);
    mixColumns(state);
    addRoundKey(state, roundKeys[r]);
  }
  subBytes(state);
  shiftRows(state);
  addRoundKey(state, roundKeys[roundKeys.length - 1]);
  return state;
}

// --- GHASH ----------------------------------------------------------------

function ghashMultiply(x: Uint8Array, y: Uint8Array): Uint8Array {
  const result = new Uint8Array(16);
  const v = y.slice();
  for (let i = 0; i < 128; i++) {
    if (x[i >> 3] & (0x80 >> (i & 7))) {
      for (let j = 0; j < 16; j++) result[j] ^= v[j];
    }
    const lsb = v[15] & 1;
    for (let j = 15; j > 0; j--) v[j] = (v[j] >>> 1) | ((v[j - 1] & 1) << 7);
    v[0] = v[0] >>> 1;
    if (lsb) v[0] ^= 0xe1;
  }
  return result;
}

function ghash(h: Uint8Array, data: Uint8Array): Uint8Array {
  const y = new Uint8Array(16);
  const block = new Uint8Array(16);
  let offset = 0;
  while (offset < data.length) {
    const len = Math.min(16, data.length - offset);
    block.fill(0);
    block.set(data.subarray(offset, offset + len));
    offset += len;
    for (let i = 0; i < 16; i++) y[i] ^= block[i];
    y.set(ghashMultiply(y, h));
  }
  return y;
}

// --- GCM ------------------------------------------------------------------

export interface AesGcmParams {
  key: Uint8Array;
  nonce: Uint8Array;
  plaintext?: Uint8Array;
  ciphertext?: Uint8Array;
  tag?: Uint8Array;
  aad?: Uint8Array;
  tagLength?: number;
}

function incrementCounter(counter: Uint8Array): void {
  for (let i = counter.length - 1; i >= 0; i--) {
    counter[i] = (counter[i] + 1) & 0xff;
    if (counter[i] !== 0) break;
  }
}

export function encryptAesGcm(params: AesGcmParams): { ciphertext: Uint8Array; tag: Uint8Array } {
  const { key, nonce, plaintext = new Uint8Array(0), aad = new Uint8Array(0), tagLength = 16 } = params;
  if (key.length !== 32) throw new Error('AES-256 requires a 32-byte key');
  if (nonce.length !== 12) throw new Error('GCM requires a 12-byte nonce');

  const roundKeys = expandKey(key);
  const h = encryptBlock(new Uint8Array(16), roundKeys);

  const j0 = new Uint8Array(16);
  j0.set(nonce);
  j0[15] = 1;

  const ciphertext = new Uint8Array(plaintext.length);
  const counter = j0.slice();
  for (let i = 0; i < plaintext.length; i += 16) {
    incrementCounter(counter);
    const encryptedCounter = encryptBlock(counter, roundKeys);
    for (let j = 0; j < 16 && i + j < plaintext.length; j++) {
      ciphertext[i + j] = plaintext[i + j] ^ encryptedCounter[j];
    }
  }

  const tag = computeTag(h, roundKeys, j0, aad, ciphertext, tagLength);
  return { ciphertext, tag };
}

function computeTag(
  h: Uint8Array,
  roundKeys: Uint8Array[],
  j0: Uint8Array,
  aad: Uint8Array,
  ciphertext: Uint8Array,
  tagLength: number,
): Uint8Array {
  const data = new Uint8Array(aad.length + ciphertext.length + 16);
  data.set(aad);
  data.set(ciphertext, aad.length);
  const lenBlock = new Uint8Array(16);
  const view = new DataView(lenBlock.buffer);
  const aadBits = aad.length * 8;
  const cBits = ciphertext.length * 8;
  view.setUint32(0, Math.floor(aadBits / 0x100000000), false);
  view.setUint32(4, aadBits >>> 0, false);
  view.setUint32(8, Math.floor(cBits / 0x100000000), false);
  view.setUint32(12, cBits >>> 0, false);
  data.set(lenBlock, aad.length + ciphertext.length);

  const s = ghash(h, data);
  const encryptedJ0 = encryptBlock(j0, roundKeys);
  const tag = new Uint8Array(tagLength);
  for (let i = 0; i < tagLength; i++) tag[i] = s[i] ^ encryptedJ0[i];
  return tag;
}

export function decryptAesGcm(params: AesGcmParams): Uint8Array {
  const { key, nonce, ciphertext, tag, aad = new Uint8Array(0), tagLength = 16 } = params;
  if (!ciphertext || !tag) throw new Error('decryptAesGcm requires ciphertext and tag');
  if (key.length !== 32) throw new Error('AES-256 requires a 32-byte key');
  if (nonce.length !== 12) throw new Error('GCM requires a 12-byte nonce');

  const roundKeys = expandKey(key);
  const h = encryptBlock(new Uint8Array(16), roundKeys);

  const j0 = new Uint8Array(16);
  j0.set(nonce);
  j0[15] = 1;

  const expectedTag = computeTag(h, roundKeys, j0, aad, ciphertext, tagLength);
  let ok = tag.length === expectedTag.length;
  if (ok) {
    for (let i = 0; i < tag.length; i++) {
      if (tag[i] !== expectedTag[i]) {
        ok = false;
        break;
      }
    }
  }
  if (!ok) throw new Error('Authentication failed');

  const plaintext = new Uint8Array(ciphertext.length);
  const counter = j0.slice();
  for (let i = 0; i < ciphertext.length; i += 16) {
    incrementCounter(counter);
    const encryptedCounter = encryptBlock(counter, roundKeys);
    for (let j = 0; j < 16 && i + j < ciphertext.length; j++) {
      plaintext[i + j] = ciphertext[i + j] ^ encryptedCounter[j];
    }
  }
  return plaintext;
}

/** Encrypt to `nonce | ciphertext | tag`. */
export function encrypt(key: Uint8Array, nonce: Uint8Array, plaintext: Uint8Array): Uint8Array {
  const { ciphertext, tag } = encryptAesGcm({ key, nonce, plaintext });
  const out = new Uint8Array(12 + ciphertext.length + tag.length);
  out.set(nonce);
  out.set(ciphertext, 12);
  out.set(tag, 12 + ciphertext.length);
  return out;
}

/** Decrypt from `nonce | ciphertext | tag`. */
export function decrypt(key: Uint8Array, sealed: Uint8Array): Uint8Array {
  if (sealed.length < 28) throw new Error('Sealed data too short');
  const nonce = sealed.subarray(0, 12);
  const tag = sealed.subarray(sealed.length - 16);
  const ciphertext = sealed.subarray(12, sealed.length - 16);
  return decryptAesGcm({ key, nonce, ciphertext, tag });
}
