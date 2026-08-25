# Cardly

A beautiful, private, open-source wallet for your physical cards.

- Local-first
- No account
- No tracking
- Encrypted vault
- Optional encrypted backup
- Open source

> **Status:** early development. The local encrypted vault, biometric unlock and
> manual card entry are working. Card scanning and Google Drive backup are on the
> roadmap — see `docs/architecture.md`.

## Features

- **Encrypted local vault.** Cards are encrypted with AES-256-GCM before they
  ever touch disk. Keys live in the platform secure store (iOS Keychain /
  Android Keystore).
- **Biometric unlock.** Face ID, Touch ID, and Android biometrics gate access to
  sensitive card details.
- **No account. No backend.** Cardly works fully offline. There is no Cardly
  server, no analytics, no advertising.
- **Copy in one tap.** Reveal a field, copy it, done. Clipboard contents are
  never logged and sensitive copies auto-clear.

## Getting started

```bash
pnpm install
pnpm web        # web preview
pnpm ios        # iOS simulator
pnpm android    # Android emulator
```

See `docs/development.md` for details.

## Building

Use EAS Build for native binaries:

```bash
pnpm --filter @cardly/mobile exec eas build --profile development   # dev build
pnpm --filter @cardly/mobile exec eas build --profile production   # release
```

The camera and biometric features require a development build (they are not
fully supported in Expo Go).

## Documentation

- [Architecture](docs/architecture.md)
- [Security model](docs/security.md)
- [Backup format](docs/backup-format.md)
- [Privacy policy](PRIVACY.md)
- [Development](docs/development.md)
- [Contributing](CONTRIBUTING.md)

## Roadmap

- **Done:** encrypted local vault, biometric unlock, manual card entry, copy
  with clipboard auto-clear, app lock, card editing, duplicate detection,
  camera capture with review + on-device OCR pre-fill (web), encrypted
  export/import, Google Drive backup + restore (requires a Google OAuth
  client ID), screenshot protection on card details.
- **Planned:** native ML Kit OCR pre-fill on device (config-gated),
  configurable app-lock timeout.

## Security

Cardly takes a conservative, honest security posture. It does not claim to be
"unhackable" — no local-first app is. Read the full threat model in
[`docs/security.md`](docs/security.md).

To report a security issue, see [`SECURITY.md`](SECURITY.md).

## License

MIT — see [LICENSE](LICENSE).
