/**
 * App lock.
 *
 * Locks the vault when the app goes to the background (and on app start),
 * and unlocks it only after the user authenticates with the device's
 * biometrics / passcode.
 *
 * The auto-prompt effect fires at most once per lock cycle (guarded by a
 * ref) and never re-prompts on failure — the user must trigger
 * `authenticate()` explicitly (e.g. pressing a "reveal" action) after a
 * failed or cancelled attempt. Pass `autoPrompt: false` for screens that
 * only want the explicit authenticate() helper (e.g. card-details reveal),
 * so the system prompt does not fire on mount.
 */
import * as LocalAuthentication from 'expo-local-authentication';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

export function useAppLock({
  enabled,
  onUnlock,
  onLock,
  autoPrompt = true,
}: {
  enabled: boolean;
  onUnlock: () => void | Promise<void>;
  onLock: () => void | Promise<void>;
  autoPrompt?: boolean;
}) {
  const [authenticated, setAuthenticated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [available, setAvailable] = useState(false);
  const prevState = useRef(AppState.currentState);
  // Guards: prompt once per lock cycle; avoid re-prompt loops.
  const promptedThisCycle = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    let alive = true;
    (async () => {
      const supported = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (alive && mounted.current) setAvailable(supported && enrolled);
    })();
    return () => {
      alive = false;
      mounted.current = false;
    };
  }, []);

  const authenticate = useCallback(async (): Promise<boolean> => {
    if (!enabled) return true;
    if (!available) return true;
    setBusy(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Cardly',
        cancelLabel: 'Cancel',
      });
      if (result.success) {
        promptedThisCycle.current = true;
        setAuthenticated(true);
        await onUnlock();
        return true;
      }
      return false;
    } finally {
      setBusy(false);
    }
  }, [enabled, available, onUnlock]);

  const lock = useCallback(async () => {
    promptedThisCycle.current = false;
    setAuthenticated(false);
    await onLock();
  }, [onLock]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      const prev = prevState.current;
      prevState.current = next;
      if (prev === 'active' && next !== 'active') {
        lock();
      }
    });
    return () => sub.remove();
  }, [lock]);

  // Auto-prompt once per lock cycle when enabled — never in a loop.
  useEffect(() => {
    if (!autoPrompt) return;
    if (!enabled || authenticated) return;
    if (!available || promptedThisCycle.current) return;
    promptedThisCycle.current = true;
    authenticate();
  }, [autoPrompt, enabled, authenticated, available, authenticate]);

  return { authenticated, busy, available, authenticate, lock };
}
