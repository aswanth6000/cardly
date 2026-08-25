/**
 * Haptic feedback helpers.
 *
 * Haptics are subtle, deliberate feedback for confirmations (copy, reveal).
 * They are skipped on web (no haptic hardware) and when the user has enabled
 * reduced motion / reduced haptics at the system level.
 */
import * as Haptics from 'expo-haptics';
import { AccessibilityInfo, Platform } from 'react-native';

export async function notifyHaptic(
  style: 'light' | 'medium' | 'success' = 'light',
): Promise<void> {
  if (Platform.OS === 'web') return;
  const reduceMotion = await AccessibilityInfo.isReduceMotionEnabled();
  if (reduceMotion) return;
  const map = {
    light: Haptics.NotificationFeedbackType.Success,
    medium: Haptics.NotificationFeedbackType.Success,
    success: Haptics.NotificationFeedbackType.Success,
  };
  try {
    if (style === 'light') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      await Haptics.notificationAsync(map[style]);
    }
  } catch {
    // Haptics are best-effort; never fail an interaction because of them.
  }
}
