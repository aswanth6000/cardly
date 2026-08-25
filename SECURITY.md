# Security Policy

## Reporting a vulnerability

Cardly is a local-first app: card data lives on the user's device and Cardly
operates no server. Still, cryptography and key handling deserve scrutiny.

**Please do not open a public issue for security problems.** Instead, email
the maintainers (or open a private security advisory via GitHub's
"Security" tab if you are a collaborator).

When reporting, include:

- The affected version(s).
- A description of the issue and its impact.
- Steps to reproduce, if any.
- Whether it has been disclosed publicly already.

You should receive an acknowledgment within a few days. We ask that you give
us reasonable time to fix and release before public disclosure.

## Scope

In scope:

- The vault encryption and key-handling code in `packages/crypto` and
  `packages/vault`.
- The backup format (`docs/backup-format.md`) and any restore path.
- Storage handling in `packages/storage`.
- Any place where sensitive card data might leak (logs, error messages,
  clipboard, screenshots, crash reports).

Out of scope (by design):

- Compromise of the user's device (root/jailbreak, keychain-level malware,
  keyloggers). No local-first app can defend against a fully compromised
  device.
- Social engineering of the user.

## Safe harbor

We will not pursue legal action against researchers who:

- Act in good faith and avoid privacy violations and destruction of data.
- Do not attack Cardly users' real devices or real card data.
- Report privately and give us time to respond.

## Our commitments

- Sensitive values never appear in logs or error messages.
- No telemetry, analytics, or crash reporting that could carry card data.
- Backups are encrypted before leaving the device, or not created at all.
