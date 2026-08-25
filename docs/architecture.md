# Cardly Architecture

Cardly is a local-first, privacy-first mobile app for storing physical card
information. This document describes the overall architecture: packages,
data flow, and the security boundaries between them.

## Principles

1. **Local-first** — all card data lives on the device. Cardly works fully
   offline.
2. **Privacy-first** — no account, no analytics, no advertising, no telemetry.
3. **Security-first** — the vault is encrypted with AES-256-GCM. Keys live in
   the platform secure store. Sensitive values are revealed only after device
   authentication.
4. **Minimal** — the app does one thing: store cards securely and let users
   retrieve details instantly.

## Repository layout

```text
cardly/
├── apps/
│   └── mobile/            # Expo app (expo-router, TypeScript)
├── packages/
│   ├── crypto/            # AES-GCM vault crypto, key derivation, wrapping
│   ├── vault/             # Encrypted vault model, card validation, formatting
│   ├── backup/            # Encrypted backup serialize/restore
│   ├── storage/           # SecureStore-backed key-value storage
│   └── ui/                # Design tokens and shared UI primitives
├── docs/                  # This documentation
└── ...
```

### Package boundaries

```
┌─────────────────────────────────────────────┐
│                 apps/mobile                  │
│  screens · navigation · auth · clipboard    │
└───────┬──────────┬───────────┬──────────────┘
        │          │           │
        ▼          ▼           ▼
  ┌─────────┐ ┌─────────┐ ┌─────────┐
  │  vault  │ │ storage │ │   ui    │
  └────┬────┘ └────┬────┘ └─────────┘
       │           │
       ▼           ▼
  ┌─────────┐ ┌─────────┐
  │ crypto  │ │ SecureStore (platform) │
  └─────────┘ └─────────┘
```

- `@cardly/crypto` and `@cardly/vault` are **platform-independent** (they run
  in Node for tests). They must never import React Native except for the
  `platform.ts` adapter.
- `@cardly/storage` wraps `expo-secure-store` and is the only place that
  touches the platform keychain/keystore.
- `@cardly/ui` holds design tokens and primitives; screens live in the app.

## Data flow

### Creating a vault (first launch)

```text
Vault.create()
  → generate 256-bit vault key (platform CSPRNG)
  → encrypt empty payload: { schemaVersion: 1, cards: [] }
  → write header (JSON) to SecureStore under "cardly.vault"
  → write vault key (hex) to SecureStore under "cardly.vault-key"
```

### Unlocking

```text
App start
  → read vault header + key from SecureStore (no auth needed)
  → open vault, decrypt payload in memory
  → wallet list renders from decrypted summaries
```

Sensitive fields (full number, CVV) are **not** shown until the user
authenticates via Face ID / Touch ID / Android biometrics. See
[Security](security.md).

### Adding a card

```text
Manual entry → validate (Luhn, expiry, CVV) → Vault.addCard()
  → decrypt payload in memory
  → append card
  → re-encrypt payload (fresh nonce)
  → persist header back to SecureStore
```

## State management

The app uses a single `VaultProvider` context that owns the in-memory vault
and the summary list. Every mutation re-reads the encrypted blob from storage,
mutates, re-encrypts, and persists — so no separate "dirty state" can drift
from what is on disk.

## Navigation

- `/` — wallet (card list)
- `/add` — add card chooser (scan / manual)
- `/add/manual` — manual entry
- `/add/scan` — camera scan (capture + review)
- `/add/review` — review & edit scanned fields before saving
- `/card/[id]` — card details (sensitive fields gated by biometrics)
- `/settings` — settings
- `/backup` — recovery password, encrypted export/import, Google Drive

## Backup

`@cardly/backup` serializes a vault into the encrypted backup format
(see [backup-format.md](backup-format.md)) and restores it with the user's
recovery password. A backup is a single JSON file (`.cardly`) containing the
vault header: the encrypted payload plus the recovery-wrapped key.

- **Export:** writes the encrypted file to the app Documents folder, or
  uploads it to Google Drive.
- **Import:** reads a `.cardly` file via the system document picker and
  restores the vault in place (replacing the current vault on this device).

## Card scanning

`/add/scan` opens the camera (`expo-camera`). On capture, the image is
processed **on-device** and card-like fields are extracted:

- **Web:** the browser's Shape Detection API (`TextDetector` / `BarcodeDetector`)
  when available; otherwise the review screen asks the user to type the
  fields.
- **Native:** the production path is a native ML Kit Text Recognition v2
  module. Expo does not ship a first-party OCR module, so `lib/ocr.ts`
  exposes a config-gated hook (`app.json` `extra.ocr.native`): when enabled
  and a native module is registered, the image URI is passed to it. Without
  it, scanning works the same but without auto-fill.

The recognized text always goes through the conservative extraction
heuristics in `packages/vault/src/scanner.ts` (Luhn-valid number, expiry
pattern, ALL-CAPS name), and the user reviews and edits every field on
`/add/review` before anything is saved — OCR is a convenience, never the
source of truth.

## Screen capture protection

The card details screen (which shows sensitive fields after authentication)
calls `usePreventScreenCapture('card-details')` while mounted, blocking
screenshots and screen recordings (`FLAG_SECURE` on Android, screen-recording
block on iOS).

## Google Drive

`apps/mobile/src/lib/drive.ts` implements the optional Drive backup:

- OAuth via `expo-auth-session`'s Google provider with the **minimum scope**
  (`https://www.googleapis.com/auth/drive.file` — only files the app creates).
- The access token (and refresh token, when the provider returns one) is
  stored in SecureStore and refreshed when expired.
- Upload uses the Drive API v3 `files.create` multipart endpoint with the
  encrypted backup JSON. Drive never sees plaintext card data.
- Restore lists the app's Drive files, downloads the chosen encrypted backup,
  and decrypts it locally with the recovery password.

The Google OAuth client ID is **not** bundled: configure it in `app.json`
`extra.googleDrive.clientId` (or `EXPO_PUBLIC_GOOGLE_DRIVE_CLIENT_ID`).
Without it the Drive section explains that it is not configured.

## Roadmap

1. ~~Local encrypted vault~~ (done)
2. ~~Biometric unlock~~ (done)
3. ~~Card creation (manual)~~ (done)
4. ~~Card scanning (camera + review)~~ (done — OCR pre-fill pending a model)
5. ~~Encrypted export/import as a file~~ (done)
6. ~~Google Drive encrypted backup~~ (done — requires a Google OAuth client ID)
7. OCR text recognition to pre-fill the review screen from the captured image
