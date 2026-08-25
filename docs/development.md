# Development

## Prerequisites

- Node.js 20+
- pnpm 9+ (`corepack enable` if you use Corepack)
- Expo SDK 57 tooling

## Install

```bash
pnpm install
```

## Run

```bash
pnpm web        # web preview (fastest for UI iteration)
pnpm ios        # iOS simulator (requires macOS + Xcode)
pnpm android    # Android emulator
```

> **Note:** Face ID and biometric authentication are not fully supported in
> Expo Go. Use a development build for realistic auth testing:
> `npx expo run:ios` / `npx expo run:android`.

## Checks

Run all three before considering work complete:

```bash
pnpm typecheck   # tsc --noEmit over packages + app
pnpm lint        # eslint (flat config) with zero warnings allowed
pnpm test        # vitest — crypto, vault, validation, backup-format
```

## Project structure

See [architecture.md](architecture.md) for the full picture.

```
apps/mobile/src/
├── app/                 # expo-router routes
│   ├── _layout.tsx      # root: theme + vault providers, app lock
│   ├── index.tsx        # wallet
│   ├── add/             # add-card flow
│   ├── card/[id].tsx    # card details
│   └── settings.tsx
├── components/          # UI components (card visual, etc.)
├── hooks/               # useAppLock
├── lib/                 # clipboard, auth service
├── vault-context.tsx    # vault provider
└── theme.tsx            # theme wiring
```

## Google Drive setup (optional)

The Drive backup feature is disabled until a Google OAuth client ID is
configured. To enable it:

1. Create an OAuth 2.0 Client ID in Google Cloud Console (Web application
   type works for web + Expo Go; native apps should use the matching native
   client types for production builds).
2. Add the redirect URI to the client's authorized redirects. For web,
   `AuthSession.makeRedirectUri()` produces a URL based on your dev server.
3. Set the client ID in `apps/mobile/app.json`:

   ```json
   "extra": { "googleDrive": { "clientId": "xxxx.apps.googleusercontent.com" } }
   ```

   or as a build-time env var: `EXPO_PUBLIC_GOOGLE_DRIVE_CLIENT_ID`.

Without it, the Backup screen shows a "not configured" message — no fake
connected state.

## Package conventions

- `packages/crypto` and `packages/vault` are **Node-runnable**. Never add a
  React Native import there except the `platform.ts` adapter. This is what
  makes the test suite work without a device.
- Keep crypto/security code isolated from UI code.
- `packages/storage` is the only place that touches the platform secure store.

## Testing crypto in Node

The app uses `expo-crypto`'s native AES-GCM / PBKDF2. The test environment
cannot run native modules, so `packages/crypto` ships pure-TypeScript
implementations (`aes-gcm-pure.ts`, `pbkdf2-pure.ts`) used **only** by tests.
They implement the same construction, which is also what keeps the backup
format verifiable end-to-end.

If a test seems slow, check for `Vault.create(password)` calls — the default
PBKDF2 iteration count (600,000) is intentionally slow. Pass
`{ pbkdf2Iterations: 1000 }` in tests.

## Adding a dependency

```bash
pnpm add <pkg> --filter @cardly/mobile
# or, for an Expo-compatible version:
cd apps/mobile && npx expo install <pkg>
```

Expo SDK 57 has specific version ranges — prefer `npx expo install`.

## Releasing

Version bumps live in `package.json` / `app.json`. There is no CI pipeline yet;
the `.github/` workflows are a future addition.
