# Changelog

All notable changes to Cardly are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- OCR pre-fill for card scanning: the captured image is processed on-device
  via the web Shape Detection API where available; a config-gated native ML
  Kit hook is documented for production. Recognized text goes through the
  existing extraction heuristics and is always user-reviewed.
- Google Drive restore: list the app's backup files, download the chosen
  encrypted backup, and restore locally with the recovery password.
- Screen capture protection on the card details screen
  (`usePreventScreenCapture` — FLAG_SECURE on Android, recording block on
  iOS).
- `PRIVACY.md` plus an in-app Privacy screen linked from Settings.
- Drive backup files can now be listed and restored in the Backup screen.

## [0.2.0] - 2026-08-25

### Added

- Edit card flow: reuse the manual-entry form, load the card, save changes.
- Duplicate card detection: adding or editing to an existing card number is
  rejected with a clear message (spacing/format differences don't bypass it).
- Haptic feedback on copy, reveal, and card save (skipped on web and when the
  system has reduced motion enabled).
- `eas.json` with development / preview / production build profiles.
- Google Drive setup instructions in `docs/development.md`.

### Changed

- Wallet empty state is now a soft card visual instead of plain text.
- Version bumped to 0.2.0.

## [Unreleased]

### Added

- Monorepo scaffold (pnpm workspaces, `apps/`, `packages/`, `docs/`).
- `@cardly/crypto`: AES-256-GCM seal/open (native via `expo-crypto`, pure
  TypeScript for tests), PBKDF2-HMAC-SHA256 key derivation, vault key
  generation and wrapping.
- `@cardly/vault`: encrypted vault model (`Vault`), card model, Luhn
  validation, expiry/CVV validation, card-number formatting, card text
  extraction heuristics for scanning.
- `@cardly/backup`: encrypted backup serialize/restore and recovery-key
  management.
- `@cardly/storage`: SecureStore-backed key-value store.
- `@cardly/ui`: design tokens (light/dark), typography, buttons, primitives.
- Mobile app:
  - Wallet home screen with masked card list and add button.
  - Manual card entry with validation.
  - Card details screen with biometric-gated reveal and per-field copy.
  - App lock on background.
  - Clipboard auto-clear for sensitive values.
  - Settings screen with delete-vault.
  - Backup screen: recovery password, encrypted export/import, Google Drive.
  - Card scanning: camera capture, review-and-edit screen before saving.
- Tests: 49 vitest tests covering crypto, vault, validation, scanner
  extraction, and the backup format.
- Documentation: architecture, security model, backup format, development,
  contributing, security policy, code of conduct.

### Notes

- OCR text recognition to pre-fill the scan review screen is not yet wired;
  the review screen lets users enter fields manually after capturing.
- Google Drive requires a Google OAuth client ID configured via
  `app.json` `extra.googleDrive.clientId` (or
  `EXPO_PUBLIC_GOOGLE_DRIVE_CLIENT_ID`).
