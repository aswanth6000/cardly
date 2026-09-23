import { AccessibilityInfo } from 'react-native';
import { useEffect, useState } from 'react';

/**
 * Resolves the system motion preference before custom animation begins.
 * The initial `ready: false` state lets callers render a stable fallback
 * instead of accidentally starting an animation for reduced-motion users.
 */
export function useReducedMotion() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (!mounted) return;
        setReduceMotion(value);
        setReady(true);
      })
      .catch(() => {
        if (mounted) setReady(true);
      });

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return { reduceMotion, ready };
}
