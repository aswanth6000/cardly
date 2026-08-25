# Cardly — development notes for agents

## Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before
writing any code. The mobile app runs Expo SDK 57.

## Repository layout

- `apps/mobile/` — the Expo app (expo-router, TypeScript)
- `packages/crypto/` — AES-GCM vault crypto, key derivation, key wrapping
- `packages/vault/` — encrypted vault model, card validation, formatting
- `packages/storage/` — SecureStore-backed key-value storage
- `packages/ui/` — design tokens and shared UI primitives
- `docs/` — architecture, security, backup-format, development

## Non-negotiables

- Never log card numbers, CVVs, cardholder names, or any sensitive value.
- Never store sensitive values outside the encrypted vault.
- `packages/crypto` and `packages/vault` must stay free of React Native
  imports except for the `platform.ts` adapter (so tests run in Node).
- Run `pnpm test` and `pnpm typecheck` before considering work complete.
