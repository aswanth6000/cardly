# Changelog

All notable changes to Cardly are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Monorepo scaffold (pnpm workspaces, `apps/`, `packages/`, `docs/`).
- `@cardly/crypto`: AES-256-GCM seal/open (native via `expo-crypto`, pure
  TypeScript for tests), PBKDF2-HMAC-SHA256 key derivation, vault key
  generation and wrapping.
- `@cardly/vault`: encrypted vault model (`Vault`), card model, Luhn
  validation, expiry/CVV validation, card-number formatting.
- `@cardly/storage`: SecureStore-backed key-value store.
- `@cardly/ui`: design tokens (light/dark), typography, buttons, primitives.
- Mobile app:
  - Wallet home screen with masked card list and add button.
  - Manual card entry with validation.
  - Card details screen with biometric-gated reveal and per-field copy.
  - App lock on background.
  - Clipboard auto-clear for sensitive values.
  - Settings screen with delete-vault.
- Tests: 37 vitest tests covering crypto, vault, validation, and the backup
  format.
- Documentation: architecture, security model, backup format, development,
  contributing, security policy, code of conduct.

### Notes

- Card scanning, encrypted export/import, and Google Drive backup are planned
  but not yet implemented.
- Recovery-key UX (password-protected vault export) is designed in the backup
  format but not yet wired into the UI.
