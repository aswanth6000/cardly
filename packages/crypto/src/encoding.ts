/**
 * Canonical (16-byte) AES-256 key.
 */
export const KEY_BYTE_LENGTH = 32;

export type RawKey = Uint8Array<ArrayBuffer>;

const HEX_RE = /^[0-9a-fA-F]*$/;
const BASE64_RE = /^[A-Za-z0-9+/]*={0,2}$/;

export function isHex(s: string): boolean {
  return HEX_RE.test(s) && s.length % 2 === 0;
}

export function isBase64(s: string): boolean {
  return BASE64_RE.test(s);
}

export function bytesToHex(bytes: Uint8Array): string {
  let out = '';
  for (const b of bytes) out += b.toString(16).padStart(2, '0');
  return out;
}

export function hexToBytes(hex: string): Uint8Array {
  if (!isHex(hex)) throw new Error('Invalid hex string');
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export function bytesToBase64(bytes: Uint8Array): string {
  // `btoa` accepts a string; pass one byte at a time to avoid Unicode issues.
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

export function base64ToBytes(b64: string): Uint8Array {
  if (!isBase64(b64)) throw new Error('Invalid base64 string');
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

export function bytesToBase64Url(bytes: Uint8Array): string {
  return bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function base64UrlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
  return base64ToBytes(b64 + pad);
}
