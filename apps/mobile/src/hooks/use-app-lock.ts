/**
 * App lock.
 *
 * Locks the vault when the app goes to the background (and on app start),
 * and unlocks it only after the user authenticates with the device's
 * biometrics / passcode.
 */
import * as LocalAuthentication from 'expo-local-authentication';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

export function useAppLock({
  enabled,
  onUnlock,
  onLock,
}: {
  enabled: boolean;
  onUnlock: () => void | Promise<void>;
  onLock: () => void | Promise<void>;
}) {
  const [authenticated, setAuthenticated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [available, setAvailable] = useState(false);
  const prevState = useRef(AppState.currentState);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const supported = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (mounted) setAvailable(supported && enrolled);
    })();
    return () => {
      mounted = false;
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

  useEffect(() => {
    if (enabled && !authenticated) {
      // Initial unlock prompt: authenticate() sets state once the user
      // responds, which is fine here (one-time, not a render loop).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      authenticate();
    }
  }, [enabled, authenticated, authenticate]);

  return { authenticated, busy, available, authenticate, lock };
}
