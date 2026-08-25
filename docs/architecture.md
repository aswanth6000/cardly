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
- `/add/scan` — scanner placeholder (future)
- `/card/[id]` — card details (sensitive fields gated by biometrics)
- `/settings` — backup placeholder, delete vault

## Testing

`pnpm test` runs vitest over `packages/**/*.test.ts`. The crypto and vault
packages are tested in Node against the pure-TypeScript AES-GCM / PBKDF2
implementations, which are also the reference for cross-platform
interoperability.

See [development.md](development.md).

## Roadmap

1. ~~Local encrypted vault~~ (done)
2. ~~Biometric unlock~~ (done)
3. ~~Card creation (manual)~~ (done)
4. Card scanning (camera + OCR, with mandatory review)
5. Encrypted export/import as a file
6. Google Drive encrypted backup
7. Recovery-key UX (password-protected vault export)
