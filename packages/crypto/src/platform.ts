/**
 * Platform adapter selection.
 *
 * The app (Expo) uses the `expo-crypto`-backed implementation. Tests use the
 * Node.js implementation. We must not import `react-native` here (this
 * package must stay runnable in Node), so the `expo-crypto` module is loaded
 * lazily via `require` inside a function — never as a static import — which
 * keeps vitest and other non-Expo bundlers from parsing it.
 *
 * The adapter is chosen statically via `process.env.EXPO_OS`, which Expo CLI
 * defines when bundling for iOS/Android/web, and which is undefined in the
 * vitest Node environment.
 */
import * as nodePlatform from './platform.node';

function isExpoRuntime(): boolean {
  return (
    typeof process !== 'undefined' &&
    (process.env.EXPO_OS === 'ios' || process.env.EXPO_OS === 'android' || process.env.EXPO_OS === 'web')
  );
}

function getExpoPlatform() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('./platform.expo');
}

export function getRandomBytes(byteCount: number): Uint8Array {
  return isExpoRuntime() ? getExpoPlatform().getRandomBytes(byteCount) : nodePlatform.getRandomBytes(byteCount);
}

export function randomUUID(): string {
  return isExpoRuntime() ? getExpoPlatform().randomUUID() : nodePlatform.randomUUID();
}
