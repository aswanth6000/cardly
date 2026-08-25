# Cardly Privacy Policy

*Last updated: 2026-08-25*

Cardly is a **local-first** card wallet. This policy describes what Cardly
does and does not collect, in plain language and without fine print.

## The short version

- Your card data stays on your device.
- Cardly does not operate a server, a database, or an account system.
- There is no advertising, no analytics, and no telemetry.
- Backups are optional, encrypted on your device, and stored only where you
  choose (a file you export, or your own Google Drive).

## What Cardly collects

**Nothing.** Cardly does not collect, transmit, or store your personal data on
any Cardly-operated system. There is no Cardly account, no Cardly backend,
and no Cardly cloud.

The app runs entirely on your device. Card information you add is encrypted
with AES-256-GCM and stored in the device's secure storage (iOS Keychain /
Android Keystore).

## What stays on your device

- Card numbers, CVVs, cardholder names, and notes — always inside the
  encrypted vault.
- Your vault encryption key — in the platform secure store.
- Camera captures during card scanning — processed on-device and never
  uploaded. The image itself is not saved after scanning.

## Backups

Backups are **opt-in** and **encrypted before they leave your device**:

- **Encrypted export** — you choose where to save the file (e.g. Files,
  email, another app). The file cannot be read without your recovery
  password.
- **Google Drive** — if you connect your own Google account, Cardly uploads
  only the encrypted backup file to your Drive, using the narrowest
  permission Google offers (`drive.file`: access only to files Cardly
  creates). Cardly cannot read your backup, and does not see your Drive.

You can disconnect Google Drive at any time from the Backup screen.

## Recovery

Cardly does not know your recovery password and cannot recover it for you. If
you lose your recovery password and your device, the vault cannot be
recovered — by design. No "forgot password" reset exists because that would
require Cardly to hold a key to your data.

## Advertising and analytics

None. Cardly contains no advertising SDK, no analytics SDK, and no crash
reporting that could carry card data. This is a deliberate, code-level
choice: the app has no network access to any Cardly service.

## Permissions

Cardly asks for the minimum permissions needed for its features:

- **Camera** — only when you use card scanning. Images are processed
  on-device and not uploaded.
- **Biometrics (Face ID / Touch ID / Android biometrics)** — to unlock your
  vault and reveal sensitive card details.

## Children

Cardly does not target children and does not knowingly collect any data from
anyone.

## Changes

If this policy changes, the "Last updated" date above will be revised and the
change noted in the project changelog.

## Contact

For privacy questions, open an issue on the [Cardly repository](https://github.com/aswanth6000/cardly)
or email the maintainers via the project's [SECURITY.md](SECURITY.md) contact.
