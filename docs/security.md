# Cardly Security Model

This document describes what Cardly protects, how it protects it, and what it
does **not** protect. It is written to be honest: Cardly is not "unhackable"
and makes no such claim.

## Threat model

### What we protect against

| Threat | Mitigation |
| --- | --- |
| Card data leaked by the app itself (logs, crash reports, analytics) | No analytics, no telemetry. Sensitive values are never logged. |
| Card data read from the device's storage by another app | Vault is encrypted at rest with AES-256-GCM. |
| Card data read from a stolen device | Device lock + biometric gate before sensitive fields render. Vault key lives in the platform secure store (Keychain / Keystore). |
| A backup file falling into the wrong hands | Backups are encrypted before upload; the encryption key never leaves the device. |
| Tampering with the vault or a backup | AES-GCM authentication tag detects any modification. |

### What we do NOT protect against

- A device that is **already compromised** (malware with root/Keychain access,
  a jailbroken/rooted device, a keylogger). If the attacker can read the
  keychain and the user's screen, no local-first app can help.
- **Physical coercion** (someone forces you to unlock the app). Cardly has no
  duress mechanism.
- **Shoulder surfing** while the user is viewing card details.
- Social engineering / phishing of the user themselves.

## Encryption

### Vault encryption

- **Algorithm:** AES-256-GCM.
- **Key:** a single random 256-bit key generated once per vault.
- **Nonce:** 12 bytes, freshly generated per encryption (never reused).
- **Authentication:** GCM tag (16 bytes) authenticates the ciphertext; any
  tampering fails decryption.
- **File format:** `nonce (12) || ciphertext (variable) || tag (16)`,
  base64-encoded in the vault's `payload` field.

The cipher is provided by the platform:

- **App:** `expo-crypto`, which delegates to CommonCrypto (iOS) / Conscrypt
  (Android) / WebCrypto (web).
- **Tests:** a pure-TypeScript implementation of the same construction is used
  so behavior is verifiable in Node. See `packages/crypto/src/aes-gcm-pure.ts`.

### Key storage

The vault key is stored in `expo-secure-store`:

- **iOS:** Keychain (`kSecClassGenericPassword`).
- **Android:** SharedPreferences encrypted with Android Keystore.

We deliberately do **not** set `requireAuthentication` on the stored key, so
the vault can be opened after a device restart without user interaction. The
biometric gate is applied at the **UI layer** instead: sensitive fields render
only after a successful `LocalAuthentication.authenticateAsync` call in the
current session. This keeps the "open → authenticate → copy" path fast and
reliable, while still requiring authentication to *see* card details.

### Key hierarchy

```text
vaultKey (random, 32 bytes)
  ├── stored in SecureStore (Keychain / Keystore)
  └── wrapped by a recovery key (PBKDF2-HMAC-SHA256 from the user's
       recovery password), stored in the vault header
       └── enables encrypted export/restore on a new device
```

Cardly never sees the recovery password and cannot recover it. If the user
loses both the device and the password, the vault is unrecoverable — by design.

## Authentication

- Face ID / Touch ID on iOS, Android biometrics.
- Device passcode fallback where the platform supports it.
- The app locks when it goes to the background (see `useAppLock`).
- Authentication is **required to reveal** card number, CVV, and cardholder
  name. It is not required to see the wallet list (masked cards only).

## Clipboard

- Copying a sensitive field writes it to the clipboard and **clears it after
  60 seconds** if the clipboard still holds it.
- The copied value is never logged and never shown in UI feedback — the toast
  only says "Copied".

## Logging / telemetry

- Cardly has **no analytics SDK, no crash-reporting SDK, and no telemetry**.
- `no-console` is a lint rule; sensitive values must never reach logs.

## What is stored where

| Data | Storage |
| --- | --- |
| Card number, CVV, cardholder name, notes | Inside the encrypted vault payload only |
| Nickname, issuer, network, last 4 (display fields) | Inside the encrypted vault payload (same blob) |
| Vault key | SecureStore (Keychain / Keystore) |
| Vault header (JSON: version, kdf config, wrapped key, payload) | SecureStore |
| Backup file (if created) | Encrypted; user's Google Drive / exported file |

The vault header contains **no** plaintext card data — not even counts.

## Privacy

- No account, no Cardly server, no advertising, no analytics.
- Google Drive, when implemented, receives only the encrypted backup blob and
  only with the minimum OAuth scopes.

## Reporting

Found a vulnerability? See [SECURITY.md](../SECURITY.md).
