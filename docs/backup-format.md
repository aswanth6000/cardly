# Cardly Backup Format

A Cardly backup is a **self-contained, encrypted JSON document**. It contains
everything needed to restore a vault on a new device **except** the user's
recovery password.

## Format

```jsonc
{
  "version": 1,
  "kdf": {
    "algorithm": "PBKDF2-HMAC-SHA256",
    "iterations": 600000
  },
  "recovery": {
    "salt": "<base64, 16 bytes>",
    "iterations": 600000
  },
  "wrappedKey": "<base64: nonce || ciphertext || tag — the vault key sealed by the recovery key>",
  "payload": "<base64: nonce || ciphertext || tag — the encrypted vault contents>"
}
```

### Field meanings

| Field | Description |
| --- | --- |
| `version` | Format version (currently `1`). |
| `kdf` | Key-derivation parameters used to derive the **recovery key** from the password. `algorithm` is always `PBKDF2-HMAC-SHA256`; `iterations` may increase over time. |
| `recovery.salt` | Random 16-byte salt, base64. Unique per vault. |
| `recovery.iterations` | PBKDF2 iteration count (mirrors `kdf.iterations`). |
| `wrappedKey` | The vault key (32 bytes) encrypted with AES-256-GCM under the recovery key. |
| `payload` | The vault contents encrypted with AES-256-GCM under the vault key. |

### What is inside `payload`

```jsonc
{
  "schemaVersion": 1,
  "cards": [
    {
      "id": "<uuid>",
      "nickname": "Travel Card",
      "issuer": "HDFC",
      "network": "visa",
      "cardNumber": "4528 1234 5678 4821",
      "cardholderName": "ASWANTH A",
      "expiryMonth": 8,
      "expiryYear": 2029,
      "cvv": "123",
      "notes": null,
      "createdAt": "2026-08-25T10:00:00.000Z",
      "updatedAt": "2026-08-25T10:00:00.000Z"
    }
  ]
}
```

The payload is plaintext only inside the device's memory after decryption.

## Cryptographic construction

### Sealed-data layout

Every encrypted value uses the same binary layout:

```text
nonce (12 bytes) | ciphertext (variable) | authentication tag (16 bytes)
```

- **Algorithm:** AES-256-GCM (NIST SP 800-38D).
- **Nonce:** random 12 bytes, generated fresh for each encryption. Never reused.
- **Tag:** 16 bytes, authenticates the ciphertext. Any tampering fails
  decryption.

Base64 encoding is standard (padded) base64.

### Key derivation

The recovery key is derived from the user's recovery password:

```text
recoveryKey = PBKDF2-HMAC-SHA256(
  password = userPassword,
  salt     = recovery.salt (16 random bytes),
  iterations = recovery.iterations,
  keyLength = 32 bytes
)
```

### Restore procedure (new device)

```text
1. Read the backup file.
2. Derive recoveryKey = PBKDF2-HMAC-SHA256(password, salt, iterations).
3. unwrapKey = AES-GCM-decrypt(wrappedKey, recoveryKey)  →  vault key (32 bytes)
4. payloadJson = AES-GCM-decrypt(payload, unwrapKey)
5. Parse payloadJson → { schemaVersion, cards }
```

If the password is wrong, step 3 or 4 fails authentication (GCM tag
mismatch) — the restore is rejected.

## Guarantees

- **No plaintext card data** appears anywhere in the file. This is enforced by
  tests (`packages/vault/src/backup.test.ts`).
- **Tamper-evident:** any modification to `payload` or `wrappedKey` fails the
  GCM authentication tag.
- **Portable:** the format is platform-independent JSON + base64. Nothing
  depends on iOS or Android specifics. The same file restores on any platform
  Cardly runs on.
- **Not recoverable by Cardly:** the recovery password never leaves the
  device. Losing the device and the password loses the vault.

## Migration

`version` is the envelope version; `schemaVersion` is the payload schema.
Future format changes should:

1. Bump `schemaVersion` for additive payload changes (new optional fields).
2. Bump `version` for breaking envelope changes, and implement a migration
   path in the restore code.

## Current status

Encrypted export/import and Google Drive backup are on the roadmap. The vault
model (`packages/vault`) already serializes to this exact format, and the
round-trip is covered by tests.
