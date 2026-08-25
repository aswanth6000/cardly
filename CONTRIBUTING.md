# Contributing to Cardly

Thanks for wanting to contribute! Cardly is a small, focused project. The
bar for merging is high on purpose: **build less, polish more.**

## Ground rules

- **No sensitive values in logs, commits, or issues.** Never paste a real
  card number, CVV, or cardholder name anywhere, even in a bug report. Use
  obvious test data (`4242 4242 4242 4242` is fine — it's a public test
  number).
- **No analytics, no telemetry, no accounts.** Features that require a backend
  are out of scope by design.
- **Do not invent cryptography.** Use the platform's crypto (via
  `expo-crypto`) and the existing pure implementations in `packages/crypto`
  for tests. If you change crypto, update `docs/security.md` and
  `docs/backup-format.md` in the same PR.
- **Small, atomic commits.** One logical change per commit. Use conventional
  prefixes: `feat:`, `fix:`, `test:`, `docs:`, `refactor:`.

## Getting started

1. Fork the repo.
2. `pnpm install`
3. Make a branch: `feat/your-feature` (see the branch conventions below).
4. Implement + test.
5. Run `pnpm typecheck`, `pnpm lint`, `pnpm test` — all must pass.
6. Open a PR with a clear description and screenshots if UI changed.

## Branch conventions

```text
feat/card-scanning
feat/google-drive-backup
feat/biometric-lock
fix/ocr-expiry
refactor/vault-storage
docs/security-model
```

## What needs tests

- Any change to `packages/crypto` or `packages/vault` **must** include or
  update vitest coverage.
- Card validation / formatting changes need tests in `validation.test.ts`.
- Backup-format changes need tests in `backup.test.ts`.

## Code of conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Be kind, assume good faith,
and keep discussions technical.
